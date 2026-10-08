import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { api } from "./lib/api";
import { useAppStore } from "./store";
import { LandingPage } from "./components/marketing/LandingPage";
import { LessonShell } from "./components/learn/LessonShell";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import { LessonPage } from "./pages/LessonPage";
import { ProfilePage } from "./pages/ProfilePage";

function Guard({ children }: { children: React.ReactNode }) {
  const token = useAppStore((s) => s.token);
  const setUser = useAppStore((s) => s.setUser);
  const logout = useAppStore((s) => s.logout);
  const [ready, setReady] = useState(!token);

  useEffect(() => {
    if (!token) return;
    api
      .me()
      .then((r) => {
        setUser(r.user);
        setReady(true);
      })
      .catch(() => {
        logout();
        setReady(true);
      });
  }, [token, setUser, logout]);

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
  return <LessonShell>{children}</LessonShell>;
}

export default function App() {
  const token = useAppStore((s) => s.token);
  return (
    <BrowserRouter>
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
          path="/learn/profile"
          element={
            <Guard>
              <ProfilePage />
            </Guard>
          }
        />
        {/* Back-compat redirects */}
        <Route path="/lesson/:lessonId" element={<Navigate to="/learn" replace />} />
        <Route path="/profile" element={<Navigate to="/learn/profile" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
