import { useState } from "react";
import SectionHead from "@/components/ui/SectionHead";
import UserList from "@/components/users/UserList";
import UserListSkeleton from "@/components/users/UserListSkeleton";
import UserFormModal from "@/components/users/UserFormModal";
import DeleteUserModal from "@/components/users/DeleteUserModal";
import NewUserButton from "@/components/users/NewUserButton";
import { useUsers } from "@/hooks/useUsers";
import type { User } from "@/api/users";

type ModalState = null | "create" | User;

export default function UsersSection() {
  const { data: users = [], isPending, isError, error } = useUsers();
  const [modalState, setModalState] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  return (
    <section className="opacity-0 animate-fade-up [animation-delay:0.3s]">
      <SectionHead
        eyebrow="01 / 01"
        title="Users"
        status={
          isPending ? "LOADING..." : isError ? "ERROR" : `${users.length} REC`
        }
      />

      <div className="mb-5 flex justify-end">
        <NewUserButton onClick={() => setModalState("create")} />
      </div>

      {isPending && <UserListSkeleton />}

      {isError && (
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-red">
          ⚠ {error instanceof Error ? error.message : "Unknown error"}
        </p>
      )}

      {!isPending && !isError && (
        <UserList
          users={users}
          onEdit={setModalState}
          onDelete={setDeleteTarget}
        />
      )}

      {modalState !== null && (
        <UserFormModal
          user={modalState === "create" ? undefined : modalState}
          onClose={() => setModalState(null)}
        />
      )}

      {deleteTarget !== null && (
        <DeleteUserModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </section>
  );
}
