import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import HistoryPage from "./pages/HistoryPage";
import CategoriesPage from "./pages/CategoriesPage";
import { COLORS } from "./constants/colors";

// Map between the URL path and the active page.
const pathToPage = (path: string): string =>
  path.replace(/\/+$/, "").endsWith("/categories") ? "categories" : "history";

const pageToPath = (page: string): string =>
  page === "categories" ? "/categories" : "/";

function App() {
  const [currentPage, setCurrentPage] = useState(() =>
    pathToPage(window.location.pathname),
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Keep the active page in sync with browser back/forward navigation.
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(pathToPage(window.location.pathname));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    const path = pageToPath(page);
    if (window.location.pathname !== path) {
      // Preserve any existing query string (e.g. year/month on history).
      const search = page === "history" ? window.location.search : "";
      window.history.pushState({}, "", `${path}${search}`);
    }
  };

  const appStyle: React.CSSProperties = {
    display: "flex",
    minHeight: "100vh",
    background: COLORS.secondary.s01,
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    marginLeft: isSidebarCollapsed ? "80px" : "360px",
    transition: "margin-left 0.3s ease",
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div style={appStyle}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
      <main style={mainStyle}>
        {currentPage === "history" && <HistoryPage />}
        {currentPage === "categories" && <CategoriesPage />}
      </main>
    </div>
  );
}

export default App;
