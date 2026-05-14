import Masthead from "../components/ui/Masthead";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="app login-page">
      <Masthead sectorLabel="ACCESS PORTAL" sectorAccent="AUTH REQUIRED" />

      <div className="login-wrap">
        <div className="hud-frame login-frame">
          <span className="bracket-bl" />
          <span className="bracket-br" />

          <div className="login-eyebrow">
            <span className="section-eyebrow">OPERATOR ACCESS</span>
            <span className="login-id">SYS-AUTH-01</span>
          </div>

          <h1 className="login-title">IDENTITY VERIFICATION</h1>
          <p className="login-sub">
            Enter credentials to access the Operations Console.
          </p>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
