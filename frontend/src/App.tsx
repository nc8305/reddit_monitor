import { useState } from "react";
import { LoginPage } from "./components/auth/LoginPage";
import { SignUpPage } from "./components/auth/SignUpPage";
import { MainLayout } from "./components/layout/MainLayout";
import { ChildMonitoring } from "./components/monitoring/ChildMonitoring";
import { TrendsCenter } from "./components/trends/TrendsCenter";
import { AlertsPage } from "./components/alerts/AlertsPage";
import { SettingsPage } from "./components/settings/SettingsPage";
import { Toaster } from "sonner"; // Import Toaster

type AuthView = "login" | "signup";
type AppPage = "monitoring" | "trends" | "alerts" | "settings";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [currentPage, setCurrentPage] = useState<AppPage>("trends");

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleSignUp = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthView("login");
    setCurrentPage("trends");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as AppPage);
  };

  const handleViewChild = () => {
    setCurrentPage("monitoring");
  };

  // Helper function to render content based on auth state
  const renderContent = () => {
    if (!isAuthenticated) {
      if (authView === "login") {
        return (
          <LoginPage
            onLogin={handleLogin}
            onNavigateToSignUp={() => setAuthView("signup")}
          />
        );
      } else if (authView === "signup") {
        return (
          <SignUpPage
            onSignUp={handleSignUp}
            onNavigateToLogin={() => setAuthView("login")}
          />
        );
      }
    }

    return (
      <MainLayout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        {currentPage === "monitoring" && <ChildMonitoring />}
        {currentPage === "trends" && <TrendsCenter />}
        {currentPage === "alerts" && <AlertsPage />}
        {currentPage === "settings" && <SettingsPage />}
      </MainLayout>
    );
  };

  return (
    <>
      {renderContent()}
      {/* Toaster must be OUTSIDE the conditional returns to work globally */}
      <Toaster position="top-right" richColors={true} />
    </>
  );
}
