import Masthead from "../components/ui/Masthead";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative mx-auto min-h-screen max-w-[1180px] px-10 pt-8 pb-30 max-sm:px-4.5">
      <Masthead sectorLabel="ACCESS PORTAL" sectorAccent="AUTH REQUIRED" />

      <div className="flex items-center justify-center py-10 pb-20">
        <div className="relative w-full max-w-120 border border-hairline-glow bg-panel bg-gradient-to-b from-[var(--accent-glow-02)] to-transparent px-12 py-11">
          <span className="pointer-events-none absolute -top-0.5 -left-0.5 h-4.5 w-4.5 border-2 border-purple border-r-0 border-b-0" />
          <span className="pointer-events-none absolute -top-0.5 -right-0.5 h-4.5 w-4.5 border-2 border-purple border-l-0 border-b-0" />
          <span className="pointer-events-none absolute -bottom-0.5 -left-0.5 h-4.5 w-4.5 border-2 border-purple border-r-0 border-t-0" />
          <span className="pointer-events-none absolute -right-0.5 -bottom-0.5 h-4.5 w-4.5 border-2 border-purple border-l-0 border-t-0" />

          <div className="mb-7 flex items-center justify-between">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-purple">
              OPERATOR ACCESS
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              SYS-AUTH-01
            </span>
          </div>

          <h1 className="mb-2.5 font-mono text-xl font-medium uppercase tracking-[0.22em] text-ink">
            IDENTITY VERIFICATION
          </h1>
          <p className="mb-9 font-body text-[13px] tracking-[0.02em] text-muted">
            Enter credentials to access the Operations Console.
          </p>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
