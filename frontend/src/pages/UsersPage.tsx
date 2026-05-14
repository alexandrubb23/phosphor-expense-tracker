import NavButton from "../components/ui/NavButton";
import Masthead from "../components/ui/Masthead";
import SignOutButton from "../components/auth/SignOutButton";
import SectionHead from "../components/ui/SectionHead";
import UserList from "../components/users/UserList";
import { useUsers } from "../hooks/useUsers";

export default function UsersPage() {
  const { data: users = [], isPending, isError, error } = useUsers();

  return (
    <div className="relative mx-auto max-w-295 px-10 pt-8 pb-30 max-sm:px-4.5 max-sm:pt-5.5 max-sm:pb-20">
      <Masthead
        sectorLabel="ACCESS"
        sectorAccent="ADMIN"
        actions={
          <div className="flex items-center gap-2.5">
            <NavButton to="/">DASHBOARD</NavButton>
            <SignOutButton />
          </div>
        }
      />

      <section className="opacity-0 animate-fade-up [animation-delay:0.3s]">
        <SectionHead
          eyebrow="01 / 01"
          title="Users"
          status={
            isPending ? "LOADING..." : isError ? "ERROR" : `${users.length} REC`
          }
        />

        {isPending && (
          <div className="flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
            <span>FETCHING RECORDS</span>
            <span className="animate-blink">...</span>
          </div>
        )}

        {isError && (
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-red">
            ⚠ {error instanceof Error ? error.message : "Unknown error"}
          </p>
        )}

        {!isPending && !isError && <UserList users={users} />}
      </section>
    </div>
  );
}
