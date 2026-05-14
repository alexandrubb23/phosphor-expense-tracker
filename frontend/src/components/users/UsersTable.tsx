import { Pencil } from "lucide-react";
import type { User } from "@/api/users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
}

function shortId(id: string) {
  return `USR-${id.slice(-6).toUpperCase()}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function UsersTable({ users, onEdit }: UsersTableProps) {
  return (
    <Table className="border-collapse border border-hairline bg-panel">
      <TableHeader>
        <TableRow className="border-b border-cyan-dim bg-surface hover:bg-surface">
          <TableHead className="px-4.5 py-3.5 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-cyan">
            ID
          </TableHead>
          <TableHead className="px-4.5 py-3.5 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-cyan">
            NAME
          </TableHead>
          <TableHead className="px-4.5 py-3.5 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-cyan">
            EMAIL
          </TableHead>
          <TableHead className="px-4.5 py-3.5 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-cyan">
            ROLE
          </TableHead>
          <TableHead className="px-4.5 py-3.5 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-cyan">
            VERIFIED
          </TableHead>
          <TableHead className="px-4.5 py-3.5 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-cyan">
            JOINED
          </TableHead>
          <TableHead className="px-4.5 py-3.5 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-cyan">
            ACTIONS
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow
            key={user.id}
            className="border-b border-hairline transition-colors duration-200 hover:bg-panel-raised"
          >
            <TableCell className="px-4.5 py-4 font-mono text-[11px] tracking-[0.04em] text-muted">
              {shortId(user.id)}
            </TableCell>
            <TableCell className="px-4.5 py-4 font-body text-sm text-ink">
              {user.name}
            </TableCell>
            <TableCell className="px-4.5 py-4 font-mono text-[11px] tracking-[0.04em] text-ink-soft">
              {user.email}
            </TableCell>
            <TableCell className="px-4.5 py-4">
              <span
                className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${
                  user.role === "admin"
                    ? "border-cyan-dim bg-surface text-cyan"
                    : "border-hairline bg-surface text-muted"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    user.role === "admin"
                      ? "bg-cyan shadow-[0_0_6px_rgba(0,229,255,0.5)]"
                      : "bg-muted"
                  }`}
                />
                {user.role}
              </span>
            </TableCell>
            <TableCell className="px-4.5 py-4 font-mono text-[11px] uppercase tracking-[0.16em]">
              <span className={user.emailVerified ? "text-green" : "text-red"}>
                {user.emailVerified ? "YES" : "NO"}
              </span>
            </TableCell>
            <TableCell className="px-4.5 py-4 font-mono text-[11px] tracking-[0.06em] text-ink-soft">
              {formatDate(user.createdAt)}
            </TableCell>
            <TableCell className="px-4.5 py-4 text-right">
              <button
                type="button"
                onClick={() => onEdit(user)}
                aria-label={`Edit ${user.name}`}
                className="text-muted transition-colors duration-200 hover:text-cyan"
              >
                <Pencil size={14} />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
