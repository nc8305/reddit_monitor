import { useState, useEffect } from "react";
import { LoginPage } from "./components/auth/LoginPage";
import { SignUpPage } from "./components/auth/SignUpPage";
import { MainLayout } from "./components/layout/MainLayout";

// Import đầy đủ các trang con
import { Dashboard } from "./components/dashboard/Dashboard";
import { TrendsCenter } from "./components/trends/TrendsCenter";
import { ChildMonitoring } from "./components/monitoring/ChildMonitoring";
import { AlertsPage } from "./components/alerts/AlertsPage";
import { SettingsPage } from "./components/settings/SettingsPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setCurrentPage("dashboard"); // Reset về trang chủ khi đăng xuất
  };

  // --- Hàm renderPage PHẢI nằm trong component App ---
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "trends":
        return <TrendsCenter />;
      case "monitoring":
        return <ChildMonitoring />;
      case "alerts":
        return <AlertsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  // Logic hiển thị giao diện chính
  if (isLoggedIn) {
    return (
      <MainLayout
        // Gọi hàm renderPage() ở đây để lấy nội dung thay đổi
        children={renderPage()} 
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        onLogout={handleLogout}
      />
    );
  }

  // Logic hiển thị Login/Signup khi chưa đăng nhập
  return (
    <>
      {showSignUp ? (
        <SignUpPage 
         onSignUp={() => setShowSignUp(false)}
         onNavigateToLogin={() => setShowSignUp(false)}
        />
      ) : (
        <LoginPage 
          onLogin={handleLogin} 
          onNavigateToSignUp={() => setShowSignUp(true)} 
        />
      )}
    </>
  );
}

export default App;