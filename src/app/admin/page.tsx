import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RolePicker } from "@/components/role-picker";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import {
  approveCard,
  cancelUnfreezeRequest,
  rejectCard,
  setUserRole,
  unfreezeCard,
} from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
export const metadata = {
  title: "Адмін — заявки на картки",
};
export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/unauthorized");
  if (session.user.role !== "ADMIN" && session.user.role !== "OWNER")
    redirect("/unauthorized");
  const [pendingCards, unfreezeRequests, rolePanelUsers] = await Promise.all([
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
    <main className="max-w-content mb-auto flex w-full flex-col gap-6 px-4 text-sm font-normal">
      <Panel as="section" className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-ink-strong m-0 text-base font-normal not-italic">
            Заявки на активацію карток
          </h1>
          <Badge>{pendingCards.length} очікує</Badge>
        </div>

        {pendingCards.length === 0 ? (
          <p className="text-ink-placeholder m-0 py-8 text-center text-sm">
            Немає очікуючих заявок
          </p>
        ) : (
          <div className="border-border-subtle bg-surface-card overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-normal [&_button]:font-normal [&_th]:font-normal">
                <thead>
                  <tr className="text-ink-strong bg-white text-left">
                    <th className="px-4 py-2 whitespace-nowrap">Користувач</th>
                    <th className="px-4 py-2 whitespace-nowrap">
                      Назва картки
                    </th>
                    <th className="px-4 py-2 whitespace-nowrap">Тип</th>
                    <th className="px-4 py-2 whitespace-nowrap">Дата заявки</th>
                    <th className="px-4 py-2 whitespace-nowrap">Дія</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCards.map((card) => {
                    return (
                      <tr
                        key={card.id}
                        className="border-border-subtle border-t bg-white"
                      >
                        <td className="px-4 py-4">
                          <div className="text-ink-strong">
                            {[
                              card.user.userProfile?.firstName,
                              card.user.userProfile?.lastName,
                            ]
                              .filter(Boolean)
                              .join(" ") || "—"}
                          </div>
                          <div className="text-ink-strong text-xs">
                            {card.user.email}
                          </div>
                        </td>
                        <td className="text-ink-strong px-4 py-4">
                          {card.name}
                        </td>
                        <td className="text-ink-strong px-4 py-4">
                          {card.product.type}
                        </td>
                        <td className="text-ink-strong px-4 py-4 whitespace-nowrap">
                          {card.createdAt.toLocaleDateString("uk-UA", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <form action={approveCard.bind(null, card.id)}>
                              <PrimaryButton
                                type="submit"
                                className="whitespace-nowrap"
                              >
                                Активувати
                              </PrimaryButton>
                            </form>
                            <form action={rejectCard.bind(null, card.id)}>
                              <SecondaryButton
                                type="submit"
                                className="whitespace-nowrap"
                              >
                                Відхилити
                              </SecondaryButton>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Panel>

      <Panel as="section" className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-ink-strong m-0 text-base font-normal not-italic">
            Запити на розмороження
          </h2>
          <Badge>{unfreezeRequests.length} очікує</Badge>
        </div>

        {unfreezeRequests.length === 0 ? (
          <p className="text-ink-placeholder m-0 py-8 text-center text-sm">
            Немає запитів на розмороження
          </p>
        ) : (
          <div className="border-border-subtle bg-surface-card overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-normal [&_button]:font-normal [&_th]:font-normal">
                <thead>
                  <tr className="text-ink-strong bg-white text-left">
                    <th className="px-4 py-2 whitespace-nowrap">Користувач</th>
                    <th className="px-4 py-2 whitespace-nowrap">Картка</th>
                    <th className="px-4 py-2 whitespace-nowrap">Тип</th>
                    <th className="px-4 py-2 whitespace-nowrap">Дата запиту</th>
                    <th className="px-4 py-2 whitespace-nowrap">Дія</th>
                  </tr>
                </thead>
                <tbody>
                  {unfreezeRequests.map((card) => {
                    return (
                      <tr
                        key={card.id}
                        className="border-border-subtle border-t bg-white"
                      >
                        <td className="px-4 py-4">
                          <div className="text-ink-strong">
                            {[
                              card.user.userProfile?.firstName,
                              card.user.userProfile?.lastName,
                            ]
                              .filter(Boolean)
                              .join(" ") || "—"}
                          </div>
                          <div className="text-ink-strong text-xs">
                            {card.user.email}
                          </div>
                        </td>
                        <td className="text-ink-strong px-4 py-4">
                          {card.name}
                        </td>
                        <td className="text-ink-strong px-4 py-4">
                          {card.product.type}
                        </td>
                        <td className="text-ink-strong px-4 py-4 whitespace-nowrap">
                          {card.unfreezeRequestedAt?.toLocaleDateString(
                            "uk-UA",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          ) ?? "—"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <form action={unfreezeCard.bind(null, card.id)}>
                              <PrimaryButton
                                type="submit"
                                className="whitespace-nowrap"
                              >
                                Розморозити
                              </PrimaryButton>
                            </form>
                            <form
                              action={cancelUnfreezeRequest.bind(null, card.id)}
                            >
                              <SecondaryButton
                                type="submit"
                                className="whitespace-nowrap"
                              >
                                Відхилити
                              </SecondaryButton>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Panel>

      {session.user.role === "OWNER" && (
        <Panel as="section" className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-ink-strong m-0 text-base font-normal not-italic">
              Ролі користувачів
            </h2>
            <Badge aria-hidden className="invisible select-none">
              0 очікує
            </Badge>
          </div>

          {rolePanelUsers.length === 0 ? (
            <p className="text-ink-placeholder m-0 py-8 text-center text-sm">
              Немає користувачів
            </p>
          ) : (
            <div className="border-border-subtle bg-surface-card overflow-hidden rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-normal [&_button]:font-normal [&_th]:font-normal">
                  <thead>
                    <tr className="text-ink-strong bg-white text-left">
                      <th className="px-4 py-2 whitespace-nowrap">
                        Користувач
                      </th>
                      <th className="px-4 py-2 whitespace-nowrap">Роль</th>
                      <th className="px-4 py-2 whitespace-nowrap">Дія</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rolePanelUsers.map((u) => {
                      const isSelf = u.id === session.user.id;
                      return (
                        <tr
                          key={u.id}
                          className="border-border-subtle border-t bg-white"
                        >
                          <td className="px-4 py-4">
                            <div className="text-ink-strong">
                              {[
                                u.userProfile?.firstName,
                                u.userProfile?.lastName,
                              ]
                                .filter(Boolean)
                                .join(" ") || "—"}
                            </div>
                            <div className="text-ink-strong text-xs">
                              {u.email}
                            </div>
                          </td>
                          <td className="text-ink-strong px-4 py-4">
                            {u.role}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <form action={setUserRole} className="contents">
                                <input
                                  type="hidden"
                                  name="targetUserId"
                                  value={u.id}
                                />
                                <RolePicker
                                  name="newRole"
                                  defaultValue={u.role}
                                  disabled={isSelf}
                                  ariaLabel={`Нова роль для ${u.email}`}
                                />
                                <PrimaryButton
                                  type="submit"
                                  disabled={isSelf}
                                  className="whitespace-nowrap"
                                >
                                  Застосувати
                                </PrimaryButton>
                              </form>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Panel>
      )}
    </main>
  );
}
