import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useProfile } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Dashboard } from "@/pages/Dashboard";
import { Subjects } from "@/pages/Subjects";
import { SubjectDetail } from "@/pages/SubjectDetail";
import { ChapterDetail } from "@/pages/ChapterDetail";
import { Notes } from "@/pages/Notes";
import { Search } from "@/pages/Search";
import { Settings } from "@/pages/Settings";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setDark = useThemeStore((s) => s.setDark);

  useProfile();

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    setDark(isDark);
  }, [setDark]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthGuard>
            <Login />
          </AuthGuard>
        }
      />
      <Route
        path="/register"
        element={
          <AuthGuard>
            <Register />
          </AuthGuard>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/subjects/:subjectId" element={<SubjectDetail />} />
        <Route path="/subjects/:subjectId/chapters/:chapterId" element={<ChapterDetail />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/search" element={<Search />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
