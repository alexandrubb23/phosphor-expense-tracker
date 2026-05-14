import NavButton from "../components/ui/NavButton";
import Masthead from "../components/ui/Masthead";
import SignOutButton from "../components/auth/SignOutButton";
import UsersSection from "../components/users/UsersSection";

export default function UsersPage() {
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

      <UsersSection />
    </div>
  );
}
