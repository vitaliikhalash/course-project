"use client";

import { CardStatusPicker } from "@/components/card-status-picker";
import { PanelPagination } from "@/components/panel-pagination";
import { PanelSearchToolbar } from "@/components/panel-search-toolbar";
import { RolePicker } from "@/components/role-picker";
import { Panel } from "@/components/ui/panel";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import {
  approveCard,
  cancelUnfreezeRequest,
  rejectCard,
  setCardStatus,
  setUserRole,
  unfreezeCard,
} from "@/lib/actions/admin";
import { PANEL_PAGE_SIZE } from "@/lib/pagination";
import type { CardStatus } from "@/types";
import { useCallback, useMemo, useState } from "react";

export type AdminDashboardCard = {
  id: string;
  name: string;
  status: CardStatus;
  createdAt: string;
  unfreezeRequestedAt: string | null;
  user: {
    email: string;
    userProfile: {
      firstName: string | null;
      lastName: string | null;
    } | null;
  };
  product: { type: string };
};

export type AdminDashboardUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN" | "OWNER";
  userProfile: {
    firstName: string | null;
    lastName: string | null;
  } | null;
};

function displayUserName(u: AdminDashboardCard["user"]): string {
  const parts = [
    u.userProfile?.firstName,
    u.userProfile?.lastName,
  ].filter(Boolean);
  return parts.join(" ") || "—";
}

function rowHaystackCard(card: AdminDashboardCard): string {
  return [
    displayUserName(card.user),
    card.user.email,
    card.name,
    card.product.type,
    card.status,
  ]
    .join(" ")
    .toLowerCase();
}

function matchesSearch(haystackLower: string, q: string): boolean {
  const t = q.trim().toLowerCase();
  if (!t) return true;
  return haystackLower.includes(t);
}

function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

function dateInFilterRange(
  iso: string | null | undefined,
  from: string,
  to: string,
): boolean {
  if (!from && !to) return true;
  if (!iso) return false;
  const key = dateKey(iso);
  if (from && key < from) return false;
  if (to && key > to) return false;
  return true;
}

interface AdminDashboardClientProps {
  pendingCards: AdminDashboardCard[];
  unfreezeCards: AdminDashboardCard[];
  allCards: AdminDashboardCard[];
  roleUsers: AdminDashboardUser[];
  showRolesPanel: boolean;
  currentUserId: string;
}

export function AdminDashboardClient({
  pendingCards,
  unfreezeCards,
  allCards,
  roleUsers,
  showRolesPanel,
  currentUserId,
}: AdminDashboardClientProps) {
  const [pendingSearch, setPendingSearchState] = useState("");
  const [pendingFrom, setPendingFromState] = useState("");
  const [pendingTo, setPendingToState] = useState("");
  const [unfreezeSearch, setUnfreezeSearchState] = useState("");
  const [unfreezeFrom, setUnfreezeFromState] = useState("");
  const [unfreezeTo, setUnfreezeToState] = useState("");
  const [allSearch, setAllSearchState] = useState("");
  const [rolesSearch, setRolesSearchState] = useState("");
  const [pagePending, setPagePending] = useState(1);
  const [pageUnfreeze, setPageUnfreeze] = useState(1);
  const [pageAll, setPageAll] = useState(1);
  const [pageRoles, setPageRoles] = useState(1);

  const filteredPending = useMemo(
    () =>
      pendingCards.filter((card) => {
        if (!matchesSearch(rowHaystackCard(card), pendingSearch)) return false;
        return dateInFilterRange(card.createdAt, pendingFrom, pendingTo);
      }),
    [pendingCards, pendingSearch, pendingFrom, pendingTo],
  );

  const filteredUnfreeze = useMemo(
    () =>
      unfreezeCards.filter((card) => {
        if (!matchesSearch(rowHaystackCard(card), unfreezeSearch)) return false;
        return dateInFilterRange(
          card.unfreezeRequestedAt,
          unfreezeFrom,
          unfreezeTo,
        );
      }),
    [unfreezeCards, unfreezeSearch, unfreezeFrom, unfreezeTo],
  );

  const filteredAll = useMemo(
    () =>
      allCards.filter((card) => matchesSearch(rowHaystackCard(card), allSearch)),
    [allCards, allSearch],
  );

  const filteredRoles = useMemo(
    () =>
      roleUsers.filter((u) => {
        const h = [
          u.userProfile?.firstName,
          u.userProfile?.lastName,
          u.email,
          u.role,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return matchesSearch(h, rolesSearch);
      }),
    [roleUsers, rolesSearch],
  );

  const totalPagesPending = Math.max(
    1,
    Math.ceil(filteredPending.length / PANEL_PAGE_SIZE),
  );
  const totalPagesUnfreeze = Math.max(
    1,
    Math.ceil(filteredUnfreeze.length / PANEL_PAGE_SIZE),
  );
  const totalPagesAll = Math.max(
    1,
    Math.ceil(filteredAll.length / PANEL_PAGE_SIZE),
  );
  const totalPagesRoles = Math.max(
    1,
    Math.ceil(filteredRoles.length / PANEL_PAGE_SIZE),
  );

  const pagePendingClamped = Math.min(pagePending, totalPagesPending);
  const pageUnfreezeClamped = Math.min(pageUnfreeze, totalPagesUnfreeze);
  const pageAllClamped = Math.min(pageAll, totalPagesAll);
  const pageRolesClamped = Math.min(pageRoles, totalPagesRoles);

  const pagedPending = useMemo(
    () =>
      filteredPending.slice(
        (pagePendingClamped - 1) * PANEL_PAGE_SIZE,
        pagePendingClamped * PANEL_PAGE_SIZE,
      ),
    [filteredPending, pagePendingClamped],
  );
  const pagedUnfreeze = useMemo(
    () =>
      filteredUnfreeze.slice(
        (pageUnfreezeClamped - 1) * PANEL_PAGE_SIZE,
        pageUnfreezeClamped * PANEL_PAGE_SIZE,
      ),
    [filteredUnfreeze, pageUnfreezeClamped],
  );
  const pagedAll = useMemo(
    () =>
      filteredAll.slice(
        (pageAllClamped - 1) * PANEL_PAGE_SIZE,
        pageAllClamped * PANEL_PAGE_SIZE,
      ),
    [filteredAll, pageAllClamped],
  );
  const pagedRoles = useMemo(
    () =>
      filteredRoles.slice(
        (pageRolesClamped - 1) * PANEL_PAGE_SIZE,
        pageRolesClamped * PANEL_PAGE_SIZE,
      ),
    [filteredRoles, pageRolesClamped],
  );

  const setPendingSearch = useCallback((v: string) => {
    setPendingSearchState(v);
    setPagePending(1);
  }, []);
  const setPendingFrom = useCallback((v: string) => {
    setPendingFromState(v);
    setPagePending(1);
  }, []);
  const setPendingTo = useCallback((v: string) => {
    setPendingToState(v);
    setPagePending(1);
  }, []);

  const setUnfreezeSearch = useCallback((v: string) => {
    setUnfreezeSearchState(v);
    setPageUnfreeze(1);
  }, []);
  const setUnfreezeFrom = useCallback((v: string) => {
    setUnfreezeFromState(v);
    setPageUnfreeze(1);
  }, []);
  const setUnfreezeTo = useCallback((v: string) => {
    setUnfreezeToState(v);
    setPageUnfreeze(1);
  }, []);

  const setAllSearch = useCallback((v: string) => {
    setAllSearchState(v);
    setPageAll(1);
  }, []);

  const setRolesSearch = useCallback((v: string) => {
    setRolesSearchState(v);
    setPageRoles(1);
  }, []);

  return (
    <main className="max-w-content mb-auto flex w-full flex-col gap-6 px-4 text-sm font-normal">
      <Panel as="section" className="flex flex-col gap-4 p-4">
        <h1 className="text-ink-strong m-0 self-stretch text-base font-normal not-italic">
          Заявки на активацію карток
        </h1>
        <PanelSearchToolbar
          searchId="admin-pending-search"
          searchValue={pendingSearch}
          onSearchChange={setPendingSearch}
          searchLabel="Пошук заявок на картки"
          showPeriod
          dateFrom={pendingFrom}
          dateTo={pendingTo}
          onDateFromChange={setPendingFrom}
          onDateToChange={setPendingTo}
        />

        {filteredPending.length === 0 ? (
          <p className="text-ink-placeholder m-0 py-8 text-center text-sm">
            {pendingCards.length === 0
              ? "Немає очікуючих заявок"
              : "Нічого не знайдено"}
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
                  {pagedPending.map((card) => {
                    return (
                      <tr
                        key={card.id}
                        className="border-border-subtle border-t bg-white"
                      >
                        <td className="px-4 py-4">
                          <div className="text-ink-strong">
                            {displayUserName(card.user)}
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
                          {new Date(card.createdAt).toLocaleDateString("uk-UA", {
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
        <PanelPagination
          currentPage={pagePendingClamped}
          totalPages={totalPagesPending}
          onPrevious={() =>
            setPagePending((p) =>
              Math.max(1, Math.min(p, totalPagesPending) - 1),
            )
          }
          onNext={() =>
            setPagePending((p) =>
              Math.min(
                totalPagesPending,
                Math.min(p, totalPagesPending) + 1,
              ),
            )
          }
        />
      </Panel>

      <Panel as="section" className="flex flex-col gap-4 p-4">
        <h2 className="text-ink-strong m-0 self-stretch text-base font-normal not-italic">
          Запити на розмороження карток
        </h2>
        <PanelSearchToolbar
          searchId="admin-unfreeze-search"
          searchValue={unfreezeSearch}
          onSearchChange={setUnfreezeSearch}
          searchLabel="Пошук запитів на розмороження карток"
          showPeriod
          dateFrom={unfreezeFrom}
          dateTo={unfreezeTo}
          onDateFromChange={setUnfreezeFrom}
          onDateToChange={setUnfreezeTo}
        />

        {filteredUnfreeze.length === 0 ? (
          <p className="text-ink-placeholder m-0 py-8 text-center text-sm">
            {unfreezeCards.length === 0
              ? "Немає запитів на розмороження карток"
              : "Нічого не знайдено"}
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
                  {pagedUnfreeze.map((card) => {
                    return (
                      <tr
                        key={card.id}
                        className="border-border-subtle border-t bg-white"
                      >
                        <td className="px-4 py-4">
                          <div className="text-ink-strong">
                            {displayUserName(card.user)}
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
                          {card.unfreezeRequestedAt
                            ? new Date(card.unfreezeRequestedAt).toLocaleDateString(
                                "uk-UA",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                },
                              )
                            : "—"}
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
                              action={cancelUnfreezeRequest.bind(
                                null,
                                card.id,
                              )}
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
        <PanelPagination
          currentPage={pageUnfreezeClamped}
          totalPages={totalPagesUnfreeze}
          onPrevious={() =>
            setPageUnfreeze((p) =>
              Math.max(1, Math.min(p, totalPagesUnfreeze) - 1),
            )
          }
          onNext={() =>
            setPageUnfreeze((p) =>
              Math.min(
                totalPagesUnfreeze,
                Math.min(p, totalPagesUnfreeze) + 1,
              ),
            )
          }
        />
      </Panel>

      <Panel as="section" className="flex flex-col gap-4 p-4">
        <h2 className="text-ink-strong m-0 self-stretch text-base font-normal not-italic">
          Картки користувачів
        </h2>
        <PanelSearchToolbar
          searchId="admin-all-cards-search"
          searchValue={allSearch}
          onSearchChange={setAllSearch}
          searchLabel="Пошук карток користувачів"
          showPeriod={false}
        />

        {filteredAll.length === 0 ? (
          <p className="text-ink-placeholder m-0 py-8 text-center text-sm">
            {allCards.length === 0 ? "Немає карток" : "Нічого не знайдено"}
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
                    <th className="px-4 py-2 whitespace-nowrap">Статус</th>
                    <th className="px-4 py-2 whitespace-nowrap">Дія</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedAll.map((card) => {
                    return (
                      <tr
                        key={card.id}
                        className="border-border-subtle border-t bg-white"
                      >
                        <td className="px-4 py-4">
                          <div className="text-ink-strong">
                            {displayUserName(card.user)}
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
                          {card.status}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <form action={setCardStatus} className="contents">
                              <input
                                type="hidden"
                                name="cardId"
                                value={card.id}
                              />
                              <CardStatusPicker
                                name="newStatus"
                                defaultValue={card.status}
                                ariaLabel={`Новий статус картки ${card.name}`}
                              />
                              <PrimaryButton
                                type="submit"
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
        <PanelPagination
          currentPage={pageAllClamped}
          totalPages={totalPagesAll}
          onPrevious={() =>
            setPageAll((p) =>
              Math.max(1, Math.min(p, totalPagesAll) - 1),
            )
          }
          onNext={() =>
            setPageAll((p) =>
              Math.min(
                totalPagesAll,
                Math.min(p, totalPagesAll) + 1,
              ),
            )
          }
        />
      </Panel>

      {showRolesPanel && (
        <Panel as="section" className="flex flex-col gap-4 p-4">
          <h2 className="text-ink-strong m-0 self-stretch text-base font-normal not-italic">
            Ролі користувачів
          </h2>
          <PanelSearchToolbar
            searchId="admin-roles-search"
            searchValue={rolesSearch}
            onSearchChange={setRolesSearch}
            searchLabel="Пошук користувачів"
            showPeriod={false}
          />

          {filteredRoles.length === 0 ? (
            <p className="text-ink-placeholder m-0 py-8 text-center text-sm">
              {roleUsers.length === 0
                ? "Немає користувачів"
                : "Нічого не знайдено"}
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
                    {pagedRoles.map((u) => {
                      const isSelf = u.id === currentUserId;
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
          <PanelPagination
            currentPage={pageRolesClamped}
            totalPages={totalPagesRoles}
            onPrevious={() =>
              setPageRoles((p) =>
                Math.max(1, Math.min(p, totalPagesRoles) - 1),
              )
            }
            onNext={() =>
              setPageRoles((p) =>
                Math.min(
                  totalPagesRoles,
                  Math.min(p, totalPagesRoles) + 1,
                ),
              )
            }
          />
        </Panel>
      )}
    </main>
  );
}
