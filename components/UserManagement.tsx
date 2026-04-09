"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { Search, Pencil, Ban, Trash2, Users, ShieldAlert, UserCircle, Mail, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { BiBlock } from "react-icons/bi";
import FilterSelect, { SelectOption } from "@/components/ui/FilterSelect";
import ConfirmModal from "@/components/modals/ConfirmModal";
import EditUserModal from "@/components/modals/EditUserModal";
import { useSession } from "next-auth/react";

export type Role = "admin" | "instructor" | "trainee";
export type Status = "active" | "blocked";

export interface UserItem {
  id: string;
  fullName: string;
  email: string;
  joinedAt: string;
  role: Role;
  status: Status;
}

const roleOptions: SelectOption<"all" | Role>[] = [
  { value: "all", label: "ทุกบทบาท" },
  { value: "admin", label: "ผู้ดูแลระบบ" },
  { value: "instructor", label: "ผู้สอน" },
  { value: "trainee", label: "ผู้เรียน" },
];

const statusOptions: SelectOption<"all" | Status>[] = [
  { value: "all", label: "ทุกสถานะ" },
  { value: "active", label: "กำลังใช้งาน" },
  { value: "blocked", label: "ระงับการใช้งาน" },
];

const roleLabelMap: Record<Role, string> = {
  admin: "ผู้ดูแลระบบ",
  instructor: "ผู้สอน",
  trainee: "ผู้อบรม",
};

const roleBadgeStyle: Record<Role, string> = {
  admin: "bg-purple-50 text-purple-700 border-purple-200",
  instructor: "bg-blue-50 text-blue-700 border-blue-200",
  trainee: "bg-[#F0F7EB] text-[#14532D] border-[#CDE3BD]",
};

export default function UserManagement({
  title = "จัดการผู้ใช้งาน",
}: {
  users?: UserItem[];
  title?: string;
}) {
  const { data: session, status: sessionStatus } = useSession();
  const userRole = (session?.user as any)?.role?.toUpperCase();
  const isAdmin = userRole === "ADMIN";

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const [userList, setUserList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const totalUsers = userList.length;
  const activeCount = userList.filter((u) => u.status === "active").length;
  const blockedCount = userList.filter((u) => u.status === "blocked").length;

  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const json = await res.json();
      setUserList(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [fetchUsers, isAdmin]);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return userList.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [userList, search, roleFilter, statusFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  type PendingAction = "toggleStatus" | "delete";
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [targetUser, setTargetUser] = useState<UserItem | null>(null);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setPendingAction(null);
    setTargetUser(null);
  }, []);

  const openToggleStatusModal = useCallback((u: UserItem) => {
    setTargetUser(u);
    setPendingAction("toggleStatus");
    setModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((u: UserItem) => {
    setTargetUser(u);
    setPendingAction("delete");
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((u: UserItem) => {
    setEditUser(u);
    setEditOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditUser(null);
    setEditOpen(false);
  }, []);

  const saveEditUser = useCallback(
    async (updated: UserItem) => {
      const res = await fetch(`/api/admin/users/${updated.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: updated.fullName,
          role: updated.role,
          status: updated.status,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("PATCH user failed:", res.status, text);
        throw new Error("บันทึกไม่สำเร็จ (ตรวจสอบ Role/ข้อมูลที่ส่ง)");
      }

      closeEditModal();
      await fetchUsers();
    },
    [closeEditModal, fetchUsers]
  );

  const confirmAction = useCallback(async () => {
    if (!targetUser || !pendingAction) return;

    if (pendingAction === "delete") {
      await fetch(`/api/admin/users/${targetUser.id}`, { method: "DELETE" });
      closeModal();
      await fetchUsers();
      return;
    }

    if (pendingAction === "toggleStatus") {
      const nextStatus: Status =
        targetUser.status === "active" ? "blocked" : "active";

      await fetch(`/api/admin/users/${targetUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      closeModal();
      await fetchUsers();
    }
  }, [targetUser, pendingAction, closeModal, fetchUsers]);

  const isTargetActive = targetUser?.status === "active";

  // กำลังโหลด session
  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#CDE3BD] border-t-[#14532D]" />
          <p className="text-sm text-[#6E8E59]">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  // ไม่ใช่ admin → แสดงหน้า access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 font-kanit">
        <div className="text-center max-w-sm space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#14532D]">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-sm text-[#6E8E59]">
            หน้านี้สามารถเข้าถึงได้เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-kanit">
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#14532D]">{title}</h1>
            <p className="text-sm text-[#6E8E59]">ค้นหา จัดการ และกำหนดสถานะผู้ใช้งานในระบบ</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#CDE3BD] bg-white px-3 py-1 text-xs text-[#14532D] shadow-[0_0_4px_0_#CAE0BC]/60">
            <span>ทั้งหมด {totalUsers} คน</span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="ผู้ใช้งานทั้งหมด"
            value={totalUsers}
            icon={<Users className="h-6 w-6 text-[#14532D]" />}
            iconBg="bg-[#F0F7EB]"
            borderColor="border-[#CDE3BD]"
          />
          <SummaryCard
            title="กำลังใช้งาน"
            value={activeCount}
            icon={<UserCircle className="h-6 w-6 text-[#16A34A]" />}
            iconBg="bg-[#DCFCE7]"
            borderColor="border-green-200"
          />
          <SummaryCard
            title="ระงับการใช้งาน"
            value={blockedCount}
            icon={<BiBlock className="h-6 w-6 text-[#DC2626]" />}
            iconBg="bg-[#FEE2E2]"
            borderColor="border-red-200"
          />
        </div>

        {/* Search + filters */}
        <div className="mb-6 rounded-2xl border border-[#CDE3BD] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative w-full md:flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86A97A]" />
              <input
                type="text"
                placeholder="ค้นหาด้วยชื่อหรืออีเมล..."
                className="h-11 w-full rounded-xl border border-[#CDE3BD] bg-white pl-9 pr-4 text-sm text-[#14532D] placeholder:text-[#A3B79A] focus:border-[#4CA771] focus:outline-none focus:ring-2 focus:ring-[#4CA771]/20 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <FilterSelect<"all" | Role>
              value={roleFilter}
              onValueChange={(v) => setRoleFilter(v)}
              placeholder="ทุกบทบาท"
              options={roleOptions}
              containerClassName="w-full md:w-auto md:min-w-[160px] md:max-w-[200px]"
            />

            <FilterSelect<"all" | Status>
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v)}
              placeholder="ทุกสถานะ"
              options={statusOptions}
              containerClassName="w-full md:w-auto md:min-w-[160px] md:max-w-[200px]"
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[#6E8E59]">
            <span>
              แสดงผล {filteredUsers.length} จาก {totalUsers} รายการ
              {loading ? " (กำลังโหลด...)" : ""}
            </span>
            {(roleFilter !== "all" || statusFilter !== "all" || search) && (
              <button
                onClick={() => { setSearch(""); setRoleFilter("all"); setStatusFilter("all"); }}
                className="text-xs font-semibold text-[#16A34A] hover:underline"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#F0F7EB]/60 border border-[#CDE3BD]" />
            ))}
          </div>
        )}

        {/* User List */}
        {!loading && (
          <>
            <div className="space-y-3">
              {paginatedUsers.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  onEdit={() => openEditModal(u)}
                  onToggleStatus={() => openToggleStatusModal(u)}
                  onDelete={() => openDeleteModal(u)}
                />
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-[#CDE3BD]">
                  <Search className="mx-auto h-10 w-10 text-[#CDE3BD] mb-3" />
                  <h3 className="text-lg font-bold text-[#14532D]">ไม่พบผู้ใช้งาน</h3>
                  <p className="text-sm text-[#6E8E59]">ลองปรับเปลี่ยนตัวกรองหรือคำค้นหาของคุณอีกครั้ง</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#CDE3BD] bg-white text-[#14532D] transition hover:bg-emerald-50 disabled:opacity-40 disabled:hover:bg-white"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map((page, i) =>
                  page === "..." ? (
                    <span key={`dot-${i}`} className="px-1.5 text-sm text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition ${
                        currentPage === page
                          ? "bg-[#14532D] text-white shadow-sm"
                          : "border border-[#CDE3BD] bg-white text-[#14532D] hover:bg-emerald-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#CDE3BD] bg-white text-[#14532D] transition hover:bg-emerald-50 disabled:opacity-40 disabled:hover:bg-white"
                >
                  <ChevronRight size={16} />
                </button>

                <span className="ml-3 text-xs text-[#6E8E59]">
                  หน้า {currentPage} / {totalPages}
                </span>
              </div>
            )}
          </>
        )}

        <ConfirmModal
          open={modalOpen}
          title={
            pendingAction === "delete"
              ? "ยืนยันการลบผู้ใช้งาน"
              : isTargetActive
              ? "ยืนยันการบล็อกผู้ใช้งาน"
              : "ยืนยันการปลดบล็อกผู้ใช้งาน"
          }
          description={
            targetUser
              ? pendingAction === "delete"
                ? `คุณต้องการลบ ${targetUser.fullName} ใช่ไหม? การลบจะไม่สามารถกู้คืนได้`
                : isTargetActive
                ? `${targetUser.fullName} จะไม่สามารถเข้าใช้งานระบบได้`
                : `${targetUser.fullName} จะสามารถกลับมาเข้าใช้งานระบบได้`
              : ""
          }
          confirmText={
            pendingAction === "delete"
              ? "ลบ"
              : isTargetActive
              ? "บล็อก"
              : "ปลดบล็อก"
          }
          cancelText="ยกเลิก"
          variant={
            pendingAction === "delete"
              ? "danger"
              : isTargetActive
              ? "warning"
              : "default"
          }
          onClose={closeModal}
          onConfirm={confirmAction}
        />

        <EditUserModal
          open={editOpen}
          user={editUser}
          onClose={closeEditModal}
          onSave={saveEditUser}
        />
      </main>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  iconBg,
  borderColor = "border-[#CDE3BD]",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  borderColor?: string;
}) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl border ${borderColor} bg-white px-5 py-5 shadow-sm transition-all hover:shadow-md`}>
      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-[#6E8E59] font-medium">{title}</p>
        <p className="text-2xl font-bold text-[#14532D]">{value}</p>
      </div>
    </div>
  );
}

function UserCard({
  user,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  user: UserItem;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  const isActive = user.status === "active";

  return (
    <div className={`rounded-2xl border bg-white px-4 py-4 shadow-sm transition-all hover:shadow-md sm:px-6 sm:py-5 ${isActive ? "border-[#CDE3BD]" : "border-red-200 bg-red-50/30"}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* User info */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#CDE3BD] to-[#86A97A] text-white text-lg font-bold">
              {user.fullName?.charAt(0)?.toUpperCase() || "?"}
            </div>
          </div>

          <div className="min-w-0 space-y-0.5">
            <p className="truncate text-base font-semibold text-[#14532D]">
              {user.fullName}
            </p>
            <div className="flex items-center gap-1.5 text-sm text-[#6E8E59]">
              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#86A97A]">
              <CalendarDays className="h-3 w-3 flex-shrink-0" />
              <span>เข้าร่วม {user.joinedAt}</span>
            </div>
          </div>
        </div>

        {/* Badges + actions */}
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {/* Role badge */}
          <span className={`inline-flex h-7 items-center rounded-lg border px-3 text-xs font-medium ${roleBadgeStyle[user.role]}`}>
            {roleLabelMap[user.role]}
          </span>

          {/* Status badge */}
          <span className={`inline-flex h-7 items-center rounded-lg px-3 text-xs font-medium ${isActive ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>
            {isActive ? "Active" : "Blocked"}
          </span>

          {/* Divider */}
          <div className="hidden h-6 w-px bg-[#CDE3BD] md:block" />

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <ActionBtn
              label="แก้ไขข้อมูล"
              onClick={onEdit}
              hoverBg="hover:bg-blue-50"
            >
              <Pencil className="h-4 w-4 text-blue-500" />
            </ActionBtn>

            <ActionBtn
              label={isActive ? "ระงับการใช้งาน" : "ปลดบล็อกผู้ใช้งาน"}
              onClick={onToggleStatus}
              hoverBg={isActive ? "hover:bg-amber-50" : "hover:bg-green-50"}
            >
              <Ban className={`h-4 w-4 ${isActive ? "text-amber-500" : "text-[#16A34A]"}`} />
            </ActionBtn>

            <ActionBtn
              label="ลบผู้ใช้งาน"
              onClick={onDelete}
              hoverBg="hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </ActionBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({
  label,
  children,
  onClick,
  hoverBg = "hover:bg-gray-100",
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  hoverBg?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl p-2 transition-colors active:scale-95 ${hoverBg}`}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}
