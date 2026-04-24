const crypto = require('crypto');
const Redis = require('ioredis');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const ws = require('ws');
const {
  PrismaClient
} = require('../src/generated/prisma');
const {
  PrismaNeon
} = require('@prisma/adapter-neon');
const {
  neonConfig
} = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = ws;
function loadProjectEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  try {
    if (!fs.existsSync(envPath)) return;
    const text = fs.readFileSync(envPath, 'utf8');
    for (let line of text.split('\n')) {
      line = line.replace(/\r$/, '');
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const m = trimmed.match(/^(?:export\s+)?([\w.]+)\s*=\s*(.*)$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2].trim();
      if (val.startsWith('"') && val.endsWith('"') || val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  } catch (e) {
    console.error('[audit-broker] could not read .env:', e && e.message ? e.message : e);
  }
}
loadProjectEnv();
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const LOG_DIR = process.env.LOG_DIR || __dirname;
const QUEUE = 'audit_queue';
const GENESIS_HASH = 'GENESIS_HASH';
const LAST_HASH_FILE = path.join(LOG_DIR, '.last_hash');
fs.mkdirSync(LOG_DIR, {
  recursive: true
});
const auditPath = path.join(LOG_DIR, 'audit.log');
const suspiciousPath = path.join(LOG_DIR, 'suspicious_activity.log');
const redis = new Redis(REDIS_URL);
redis.on('error', err => {
  console.error('[audit-broker] redis error:', err.message);
});
const databaseUrl = process.env.DATABASE_URL;
const prisma = databaseUrl ? new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: databaseUrl
  })
}) : null;
function readPreviousHashSync() {
  try {
    if (fs.existsSync(LAST_HASH_FILE)) {
      const s = fs.readFileSync(LAST_HASH_FILE, 'utf8').trim();
      if (s) return s;
    }
  } catch (e) {
    console.error('[audit-broker] read .last_hash:', e && e.message ? e.message : e);
  }
  return GENESIS_HASH;
}
async function appendJsonLine(file, level, record) {
  if (!record || typeof record.previousHash !== 'string' || typeof record.currentHash !== 'string') {
    throw new Error('appendJsonLine: record missing previousHash/currentHash');
  }
  const payload = JSON.stringify(record);
  const line = `[${level}] ${new Date().toISOString()} ${payload}\n`;
  await fsp.appendFile(file, line);
}
async function writeLastHash(hex) {
  await fsp.writeFile(LAST_HASH_FILE, hex, 'utf8');
}
async function updateVelocityForTransfer(r, userId) {
  if (!userId) return {
    count: 0,
    isHighVelocity: false
  };
  const key = `velocity:${userId}`;
  const count = await r.incr(key);
  if (count === 1) {
    await r.expire(key, 60);
  }
  return {
    count,
    isHighVelocity: count > 3
  };
}
async function mitigateFreezeSenderCard(event, reason) {
  const fromCardId = event && event.details && event.details.fromCardId;
  if (event.action !== 'transfer' || !fromCardId) return;
  if (!prisma) {
    console.error('[audit-broker] mitigation skipped: DATABASE_URL is not set (add to .env, export it, or use systemd EnvironmentFile=)');
    return;
  }
  try {
    const res = await prisma.card.updateMany({
      where: {
        id: fromCardId,
        status: 'ACTIVE'
      },
      data: {
        status: 'FROZEN'
      }
    });
    if (res.count === 1) {
      console.log(`[ACTION TAKEN] Account suspended cardId=${fromCardId} userId=${event.userId} reason=${reason}`);
    } else {
      console.warn(`[audit-broker] mitigation no-op: updateMany count=${res.count} for cardId=${fromCardId} (expected 1 for ACTIVE card; 0 = already non-ACTIVE or unknown id)`);
    }
  } catch (e) {
    console.error('[audit-broker] mitigation prisma error:', e && e.message ? e.message : e);
  }
}
function nextChainHash(previousHash, eventJsonOrRaw) {
  return crypto.createHash('sha256').update(previousHash + eventJsonOrRaw, 'utf8').digest('hex');
}
let previousHash = readPreviousHashSync();
async function main() {
  console.log(`[audit-broker] listening on "${QUEUE}" (redis=${REDIS_URL}, logs=${LOG_DIR}, chain=${previousHash === GENESIS_HASH ? 'GENESIS' : 'restored'})`);
  if (!databaseUrl) {
    console.error('[audit-broker] WARNING: DATABASE_URL is not set; card freeze is disabled. Ensure .env exists in the project root or set DATABASE_URL in the environment.');
  } else {
    console.log('[audit-broker] DATABASE_URL is set; active mitigation (freeze) is enabled');
  }
  while (true) {
    try {
      const popped = await redis.brpop(QUEUE, 0);
      if (!popped) continue;
      const [, raw] = popped;
      let event;
      try {
        event = JSON.parse(raw);
      } catch {
        const currentHash = nextChainHash(previousHash, raw);
        const record = {
          previousHash,
          currentHash,
          parseError: true,
          raw
        };
        await appendJsonLine(auditPath, 'INFO', record);
        await writeLastHash(currentHash);
        previousHash = currentHash;
        continue;
      }
      const forHashInput = JSON.stringify(event);
      const currentHash = nextChainHash(previousHash, forHashInput);
      let isHighVelocity = false;
      if (event.action === 'transfer' && event.userId) {
        const v = await updateVelocityForTransfer(redis, event.userId);
        isHighVelocity = v.isHighVelocity;
      }
      const record = {
        previousHash,
        currentHash,
        ...event,
        ruleFlags: {
          highVelocity: isHighVelocity
        }
      };
      if (isHighVelocity) {
        await appendJsonLine(suspiciousPath, 'WARNING - High Velocity', record);
        await writeLastHash(currentHash);
        previousHash = currentHash;
        await mitigateFreezeSenderCard(event, 'velocity');
      } else {
        await appendJsonLine(auditPath, 'INFO', record);
        await writeLastHash(currentHash);
        previousHash = currentHash;
      }
    } catch (err) {
      console.error('[audit-broker] loop error:', err && err.message ? err.message : err);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}
async function shutdown(signal) {
  console.log(`[audit-broker] ${signal} received, shutting down`);
  try {
    await redis.quit();
  } catch {}
  if (prisma) {
    try {
      await prisma.$disconnect();
    } catch {}
  }
  process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
main();
