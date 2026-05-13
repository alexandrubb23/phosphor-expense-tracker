import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../lib/auth-client";
import Masthead from "../components/ui/Masthead";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn.email({ email, password });

      if (result.error) {
        setError(
          result.error.message ??
            "Authentication failed. Check your credentials."
        );
        setIsLoading(false);
        return;
      }

      navigate("/", { replace: true, state: { fromLogin: true } });
    } catch {
      setError("Could not reach the server. Is the backend running?");
      setIsLoading(false);
    }
  };

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

          <form onSubmit={handleSubmit} className="login-form" ref={formRef}>
            <div className="login-field">
              <label className="login-label" htmlFor="email">
                EMAIL ADDRESS
              </label>
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="OPERATOR@DOMAIN.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                aria-invalid={!!error}
              />
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="password">
                ACCESS CODE
              </label>
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                aria-invalid={!!error}
              />
            </div>

            {error && (
              <div className="login-error" role="alert">
                ⚠ {error.toUpperCase()}
              </div>
            )}

            <button type="submit" className="login-submit" disabled={isLoading}>
              {isLoading ? "AUTHENTICATING…" : "AUTHENTICATE"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
