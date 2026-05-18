import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLUMN_WIDTHS = ["w-20", "w-32", "w-52", "w-20", "w-14", "w-24"];

export default function UserListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Table className="border-collapse border border-hairline bg-panel">
      <TableHeader>
        <TableRow className="border-b border-purple-dim bg-surface hover:bg-surface">
          {["ID", "NAME", "EMAIL", "ROLE", "VERIFIED", "JOINED"].map((col) => (
            <TableHead
              key={col}
              className="px-4.5 py-3.5 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-purple"
            >
              {col}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow
            key={i}
            className="border-b border-hairline hover:bg-panel-raised"
          >
            {COLUMN_WIDTHS.map((w, j) => (
              <TableCell key={j} className="px-4.5 py-4">
                <Skeleton className={`h-3 ${w} bg-surface`} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
