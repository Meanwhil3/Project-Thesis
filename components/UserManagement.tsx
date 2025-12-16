"use client";

import { useMemo, useState, useCallback } from "react";
import { Search, Pencil, Ban, Trash2, Users } from "lucide-react";
import { BiBlock } from "react-icons/bi";
import ConfirmModal from "@/components/modals/ConfirmModal";
import EditUserModal from "@/components/modals/EditUserModal";

export type Role = "admin" | "examiner" | "trainee";
export type Status = "active" | "blocked";

export interface UserItem {
  id: number;
  fullName: string;
  email: string;
  joinedAt: string;
  role: Role;
  status: Status;
}

const defaultUsers: UserItem[] = [
  {
    id: 1,
    fullName: "นางสาวสวัสดี วันจันทร์",
    email: "hellomonday@gmail.com",
    joinedAt: "25/10/2567",
    role: "admin",
    status: "active",
  },
  {
    id: 2,
    fullName: "นายอังคาร ลานวัด",
    email: "tuesdaytemple@gmail.com",
    joinedAt: "11/11/2567",
    role: "examiner",
    status: "active",
  },
  {
    id: 3,
    fullName: "นางพุธ ละมุดอร่อย",
    email: "wednesdaylamud@gmail.com",
    joinedAt: "10/12/2567",
    role: "trainee",
    status: "blocked",
  },
];

const roleOptions: { value: "all" | Role; label: string }[] = [
  { value: "all", label: "บทบาท" },
  { value: "admin", label: "ผู้ดูแล" },
  { value: "examiner", label: "ผู้สอบ" },
  { value: "trainee", label: "ผู้อบรม" },
];

const statusOptions: { value: "all" | Status; label: string }[] = [
  { value: "all", label: "สถานะ" },
  { value: "active", label: "กำลังใช้งาน" },
  { value: "blocked", label: "ระงับ" },
];

export default function UserManagement({
  users = defaultUsers,
  title = "จัดการผู้ใช้งาน",
}: {
  users?: UserItem[];
  title?: string;
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [userList, setUserList] = useState<UserItem[]>(users);

  const totalUsers = userList.length;
  const blockedCount = userList.filter((u) => u.status === "blocked").length;
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return userList.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [userList, search, roleFilter, statusFilter]);

  type PendingAction = "toggleStatus" | "delete";

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );
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
    (updated: UserItem) => {
      setUserList((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
      closeEditModal();
    },
    [closeEditModal]
  );

  const confirmAction = useCallback(() => {
    if (!targetUser || !pendingAction) return;

    if (pendingAction === "delete") {
      setUserList((prev) => prev.filter((x) => x.id !== targetUser.id));
      closeModal();
      return;
    }

    if (pendingAction === "toggleStatus") {
      setUserList((prev) =>
        prev.map((x) =>
          x.id === targetUser.id
            ? { ...x, status: x.status === "active" ? "blocked" : "active" }
            : x
        )
      );
      closeModal();
      return;
    }
  }, [targetUser, pendingAction, closeModal]);

  const isTargetActive = targetUser?.status === "active";

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <h1 className="mb-6 text-2xl font-medium text-[#14532D]">{title}</h1>

        {/* Summary cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-2xl bg-white px-7 py-6 shadow-[0_0_4px_0_#CAE0BC]">
            <div>
              <p className="text-base text-[#14532D]">ผู้ใช้งานทั้งหมด</p>
              <p className="text-3xl font-medium text-[#14532D]">
                {totalUsers}
              </p>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DCFCE7]">
              <Users className="h-8 w-8 text-[#16A34A]" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-white px-7 py-6 shadow-[0_0_4px_0_#CAE0BC]">
            <div>
              <p className="text-base text-[#14532D]">ระงับการใช้งาน</p>
              <p className="text-3xl font-medium text-[#14532D]">
                {blockedCount}
              </p>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FEE2E2]">
              <BiBlock className="h-8 w-8 text-[#DC2626]" />
            </div>
          </div>
        </div>

        {/* Search + filters */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่อ"
              className="h-11 w-full rounded-[5px] border border-[#CDE3BD] bg-white pl-9 pr-4 text-sm text-[#14532D] placeholder:text-[#A3B79A] focus:border-[#4CA771] focus:outline-none focus:ring-1 focus:ring-[#4CA771]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="h-11 w-full rounded-[5px] border border-[#CDE3BD] bg-white pl-4 pr-8 text-sm text-[#14532D] focus:border-[#4CA771] focus:outline-none focus:ring-1 focus:ring-[#4CA771] md:w-auto md:min-w-[140px]"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | Role)}
          >
            {roleOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            className="h-11 w-full rounded-[5px] border border-[#CDE3BD] bg-white pl-4 pr-8 text-sm text-[#14532D] focus:border-[#4CA771] focus:outline-none focus:ring-1 focus:ring-[#4CA771] md:w-auto md:min-w-[140px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | Status)}
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* List */}
        <div className="space-y-4">
          {filteredUsers.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              onEdit={() => openEditModal(u)}
              onToggleStatus={() => openToggleStatusModal(u)}
              onDelete={() => openDeleteModal(u)}
            />
          ))}

          {filteredUsers.length === 0 && (
            <p className="mt-6 text-center text-sm text-[#6E8E59]">
              ไม่พบผู้ใช้งานตามเงื่อนไขที่เลือก
            </p>
          )}
        </div>

        {/* Modal */}
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
    <div className="rounded-2xl bg-white px-4 py-4 shadow-[0_0_4px_0_#CAE0BC] sm:px-6 sm:py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="h-[72px] w-[72px] rounded-full bg-[#D9D9D9] sm:h-[92px] sm:w-[92px]" />

          <div className="min-w-0 space-y-1">
            <p className="truncate text-lg font-medium text-[#3A532D] sm:text-xl">
              {user.fullName}
            </p>
            <a
              href={`mailto:${user.email}`}
              className="block truncate text-sm text-[#16A34A] underline sm:text-base"
            >
              {user.email}
            </a>
            <p className="text-xs text-[#70C55E] sm:text-sm">
              เข้าร่วมวันที่ {user.joinedAt}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <div
            className={`flex h-7 items-center rounded-full px-4 text-xs ${
              isActive
                ? "bg-[#DCFCE7] text-[#15803D]"
                : "bg-[#FEE2E2] text-[#DC2626]"
            }`}
          >
            {isActive ? "Active" : "Block"}
          </div>

          <div className="flex h-7 items-center rounded-full border border-black/25 bg-white px-4 text-xs text-black">
            {user.role === "admin"
              ? "Admin"
              : user.role === "examiner"
              ? "ผู้สอบ"
              : "ผู้อบรม"}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <IconBtn label="แก้ไขข้อมูล" onClick={onEdit}>
              <Pencil className="h-4 w-4 text-black" />
            </IconBtn>

            <IconBtn
              label={isActive ? "ระงับการใช้งาน" : "ปลดบล็อกผู้ใช้งาน"}
              onClick={onToggleStatus}
            >
              <Ban
                className={`h-4 w-4 ${
                  isActive ? "text-[#D97706]" : "text-[#16A34A]"
                }`}
              />
            </IconBtn>

            <IconBtn label="ลบผู้ใช้งาน" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-[#DC2626]" />
            </IconBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full p-2 hover:bg-gray-100"
      aria-label={label}
    >
      {children}
    </button>
  );
}
