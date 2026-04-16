export function luhnCheck(digits: string): boolean {
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (isEven) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}
function computeCheckDigit(digits: number[]): number {
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i];
    if (isEven) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    isEven = !isEven;
  }
  return (10 - (sum % 10)) % 10;
}
export function generateLuhnCardNumber(length = 16): string {
  const partial = Array.from(
    {
      length: length - 1,
    },
    () => Math.floor(Math.random() * 10),
  );
  const checkDigit = computeCheckDigit([...partial, 0]);
  return [...partial, checkDigit].join("");
}
export function generateLuhnCardNumberWithPrefix(
  prefix: string,
  length = 16,
): string {
  if (prefix.length >= length) {
    throw new Error("Prefix length must be shorter than total card length");
  }
  const middleLength = length - prefix.length - 1;
  const middle = Array.from(
    {
      length: middleLength,
    },
    () => Math.floor(Math.random() * 10),
  );
  const digits = [...prefix.split("").map(Number), ...middle, 0];
  const checkDigit = computeCheckDigit(digits);
  digits[digits.length - 1] = checkDigit;
  return digits.join("");
}
