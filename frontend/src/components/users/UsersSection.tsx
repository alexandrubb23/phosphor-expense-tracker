import { useState } from "react";
import SectionHead from "@/components/ui/SectionHead";
import UserList from "@/components/users/UserList";
import UserListSkeleton from "@/components/users/UserListSkeleton";
import CreateUserModal from "@/components/users/CreateUserModal";
import NewUserButton from "@/components/users/NewUserButton";
import { useUsers } from "@/hooks/useUsers";

export default function UsersSection() {
  const { data: users = [], isPending, isError, error } = useUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <NewUserButton onClick={() => setIsModalOpen(true)} />
      </div>

      {isPending && <UserListSkeleton />}

      {isError && (
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-red">
          ⚠ {error instanceof Error ? error.message : "Unknown error"}
        </p>
      )}

      {!isPending && !isError && <UserList users={users} />}

      {isModalOpen && <CreateUserModal onClose={() => setIsModalOpen(false)} />}
    </section>
  );
}
