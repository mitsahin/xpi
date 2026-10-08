import { useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { useAppStore } from "../store";

export function AuthPage() {
  const setAuth = useAppStore((s) => s.setAuth);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("demo@x-pi.app");
  const [password, setPassword] = useState("demo1234");
  const [displayName, setDisplayName] = useState("Demo Learner");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res =
        mode === "login"
          ? await api.login({ email, password })
          : await api.register({ email, password, displayName, timezone: tz });
      setAuth(res.token, res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="learn-shell flex min-h-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#d7ffb8,transparent_55%),linear-gradient(#f0fff0,#ffffff)] px-4">
      <div className="animate-pop w-full max-w-md text-center">
        <div className="text-6xl font-black tracking-tight text-[var(--xpi-green)]">x-pi</div>
        <p className="mt-2 text-lg font-bold text-[#777]">
          Micro-lessons. Real streaks. Level up daily.
        </p>
        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-3 rounded-2xl border-2 border-[#e5e5e5] bg-white p-6 text-left shadow-sm"
        >
          {mode === "register" && (
            <input
              className="w-full rounded-xl border-2 border-[#e5e5e5] px-4 py-3 font-bold outline-none focus:border-[#1cb0f6]"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          )}
          <input
            className="w-full rounded-xl border-2 border-[#e5e5e5] px-4 py-3 font-bold outline-none focus:border-[#1cb0f6]"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-xl border-2 border-[#e5e5e5] px-4 py-3 font-bold outline-none focus:border-[#1cb0f6]"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm font-bold text-[#ff4b4b]">{error}</p>}
          <button
            disabled={loading}
            className="w-full rounded-2xl bg-[#58cc02] py-3 text-lg font-black uppercase tracking-wide text-white shadow-[0_4px_0_#46a302] active:translate-y-0.5 active:shadow-none disabled:opacity-60"
          >
            {loading ? "..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
        <button
          className="mt-4 font-extrabold text-[#1cb0f6]"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Need an account? Sign up" : "Have an account? Log in"}
        </button>
      </div>
    </div>
  );
}
