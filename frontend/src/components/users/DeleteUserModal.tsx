import { useDeleteUser } from "@/hooks/useDeleteUser";
import type { User } from "@/api/users";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

interface DeleteUserModalProps {
  user: User;
  onClose: () => void;
}

export default function DeleteUserModal({
  user,
  onClose,
}: DeleteUserModalProps) {
  const { mutateAsync: deleteUser } = useDeleteUser();

  return (
    <ConfirmDeleteModal
      title="Delete User"
      entityName={user.name}
      onConfirm={() => deleteUser(user.id)}
      onClose={onClose}
      fallbackError="Failed to delete user"
    />
  );
}
