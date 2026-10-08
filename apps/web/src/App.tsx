import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ApiError, api } from "./lib/api";
import { useAppStore } from "./store";
import { LandingPage } from "./components/marketing/LandingPage";
import { LessonShell } from "./components/learn/LessonShell";
import { ApiHealthBanner } from "./components/ApiHealthBanner";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import { LessonPage } from "./pages/LessonPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ReviewsPage } from "./pages/ReviewsPage";

function Guard({ children }: { children: React.ReactNode }) {
  const token = useAppStore((s) => s.token);
  const refreshToken = useAppStore((s) => s.refreshToken);
  const setUser = useAppStore((s) => s.setUser);
  const logout = useAppStore((s) => s.logout);
  const setApiHealthy = useAppStore((s) => s.setApiHealthy);
  const [ready, setReady] = useState(!token);
  const [bootError, setBootError] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await api.me();
        if (cancelled) return;
        setUser(r.user);
        setApiHealthy(true);
        setBootError("");
        setReady(true);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.offline) {
          setApiHealthy(false);
          setBootError(e.message);
          setReady(true);
          return;
        }
        // Auth truly failed (after client refresh attempt) → logout
        if (e instanceof ApiError && e.status === 401) {
          if (refreshToken) {
            try {
              const pair = await api.refresh(refreshToken);
              useAppStore
                .getState()
                .setAuth(pair.accessToken, pair.user, pair.refreshToken);
              setReady(true);
              return;
            } catch {
              /* fall through */
            }
          }
          logout();
          setReady(true);
          return;
        }
        setBootError(e instanceof Error ? e.message : "Failed to load session");
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, refreshToken, setUser, logout, setApiHealthy]);

  if (!token) return <Navigate to="/auth" replace />;
  if (!ready) {
    return (
      <LessonShell>
        <div className="flex min-h-full items-center justify-center font-extrabold text-[#777]">
          Loading x-pi...
        </div>
      </LessonShell>
    );
  }
  return (
    <LessonShell>
      {bootError && (
        <div className="border-b-2 border-[#ffb02e] bg-[#fff4ce] px-4 py-2 text-center text-sm font-extrabold text-[#915f10]">
          {bootError}
        </div>
      )}
      {children}
    </LessonShell>
  );
}

export default function App() {
  const token = useAppStore((s) => s.token);
  const logout = useAppStore((s) => s.logout);

  useEffect(() => {
    // Expose logout that also revokes refresh server-side
    const onStorage = (e: StorageEvent) => {
      if (e.key === "xpi_token" && !e.newValue) logout();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [logout]);

  return (
    <BrowserRouter>
      <ApiHealthBanner />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/auth"
          element={token ? <Navigate to="/learn" replace /> : <AuthPage />}
        />
        <Route
          path="/learn"
          element={
            <Guard>
              <HomePage />
            </Guard>
          }
        />
        <Route
          path="/learn/lesson/:lessonId"
          element={
            <Guard>
              <LessonPage />
            </Guard>
          }
        />
        <Route
          path="/learn/reviews"
          element={
            <Guard>
              <ReviewsPage />
            </Guard>
          }
        />
        <Route
          path="/learn/profile"
          element={
            <Guard>
              <ProfilePage />
            </Guard>
          }
        />
        <Route path="/lesson/:lessonId" element={<Navigate to="/learn" replace />} />
        <Route path="/profile" element={<Navigate to="/learn/profile" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
