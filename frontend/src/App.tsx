import { useState } from "react";
import { LoginPage } from "./components/auth/LoginPage";
import { SignUpPage } from "./components/auth/SignUpPage";
import { MainLayout } from "./components/layout/MainLayout";
import { Dashboard } from "./components/dashboard/Dashboard";
import { ChildMonitoring } from "./components/monitoring/ChildMonitoring";
import { TrendsCenter } from "./components/trends/TrendsCenter";
import { AlertsPage } from "./components/alerts/AlertsPage";
import { SettingsPage } from "./components/settings/SettingsPage";
import { Toaster } from "./components/ui/sonner";

type AuthView = "login" | "signup";
type AppPage = "dashboard" | "monitoring" | "trends" | "alerts" | "settings";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [currentPage, setCurrentPage] = useState<AppPage>("dashboard");

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleSignUp = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthView("login");
    setCurrentPage("dashboard");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as AppPage);
  };

  const handleViewChild = () => {
    setCurrentPage("monitoring");
  };

  // Render auth screens
  if (!isAuthenticated) {
    if (authView === "login") {
      return (
        <LoginPage
          onLogin={handleLogin}
          onNavigateToSignUp={() => setAuthView("signup")}
        />
      );
    } else {
      return (
        <SignUpPage
          onSignUp={handleSignUp}
          onNavigateToLogin={() => setAuthView("login")}
        />
      );
    }
  }

  // Render main application
  return (
    <>
      <MainLayout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        unreadAlerts={3}
      >
        {currentPage === "dashboard" && <Dashboard onViewChild={handleViewChild} />}
        {currentPage === "monitoring" && <ChildMonitoring />}
        {currentPage === "trends" && <TrendsCenter />}
        {currentPage === "alerts" && <AlertsPage />}
        {currentPage === "settings" && <SettingsPage />}
      </MainLayout>
      <Toaster position="top-right" />
    </>
  );
}
