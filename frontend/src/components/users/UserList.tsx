import type { User } from "@/api/users";
import UsersTable from "@/components/users/UsersTable";

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserList({ users, onEdit, onDelete }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="border border-hairline bg-panel px-4.5 py-12 text-center font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
        NO USERS FOUND
      </div>
    );
  }

  return <UsersTable users={users} onEdit={onEdit} onDelete={onDelete} />;
}
