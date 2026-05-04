import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  AdminDashboardClient,
  type AdminDashboardCard,
  type AdminDashboardUser,
} from "@/app/admin/admin-dashboard-client";
import { prisma } from "@/lib/prisma";
import type { CardStatus } from "@/types";

function serializeAdminCard(
  card: {
    id: string;
    name: string;
    status: string;
    createdAt: Date;
    unfreezeRequestedAt: Date | null;
    user: {
      email: string;
      userProfile: {
        firstName: string | null;
        lastName: string | null;
      } | null;
    };
    product: { type: string };
  },
): AdminDashboardCard {
  return {
    id: card.id,
    name: card.name,
    status: card.status as CardStatus,
    createdAt: card.createdAt.toISOString(),
    unfreezeRequestedAt: card.unfreezeRequestedAt?.toISOString() ?? null,
    user: {
      email: card.user.email,
      userProfile: card.user.userProfile,
    },
    product: {
      type: card.product.type,
    },
  };
}

function serializeAdminUser(u: {
  id: string;
  email: string;
  role: string;
  userProfile: {
    firstName: string | null;
    lastName: string | null;
  } | null;
}): AdminDashboardUser {
  return {
    id: u.id,
    email: u.email,
    role: u.role as AdminDashboardUser["role"],
    userProfile: u.userProfile,
  };
}

export const metadata = {
  title: "Адмін — заявки на картки",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/unauthorized");
  if (session.user.role !== "ADMIN" && session.user.role !== "OWNER")
    redirect("/unauthorized");
  const [pendingCards, unfreezeRequests, allCards, rolePanelUsers] =
    await Promise.all([
      prisma.card.findMany({
        where: {
          status: "PENDING",
        },
        include: {
          user: {
            include: {
              userProfile: true,
            },
          },
          product: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
      prisma.card.findMany({
        where: {
          status: "FROZEN",
          unfreezeRequestedAt: {
            not: null,
          },
        },
        include: {
          user: {
            include: {
              userProfile: true,
            },
          },
          product: true,
        },
        orderBy: {
          unfreezeRequestedAt: "asc",
        },
      }),
      prisma.card.findMany({
        include: {
          user: {
            include: {
              userProfile: true,
            },
          },
          product: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      session.user.role === "OWNER"
        ? prisma.user.findMany({
            select: {
              id: true,
              email: true,
              role: true,
              userProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: {
              email: "asc",
            },
          })
        : Promise.resolve([]),
    ]);
  return (
    <AdminDashboardClient
      pendingCards={pendingCards.map(serializeAdminCard)}
      unfreezeCards={unfreezeRequests.map(serializeAdminCard)}
      allCards={allCards.map(serializeAdminCard)}
      roleUsers={rolePanelUsers.map(serializeAdminUser)}
      showRolesPanel={session.user.role === "OWNER"}
      currentUserId={session.user.id}
    />
  );
}
