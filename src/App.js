import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Topbar from "./components/Topbar";
import Contacts from "./pages/Contacts";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";
import Finance from "./pages/Finance";

export default function App() {
  const [page, setPage] = useState("contacts");

  function renderPage() {
    switch (page) {
      case "contacts":
        return <Contacts />;
      case "finance":
        return <Finance />;
      case "tasks":
        return <Tasks />;
      case "reports":
        return <Reports />;
      default:
        return <Contacts />;
    }
  }

  return (
    <div
      className="app-layout"
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "rgba(74, 222, 128, 0.05)",
      }}
    >
      <Navbar current={page} onChange={setPage} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar onNavigate={setPage} />
        <div className="main-content" style={{ flex: 1, padding: "2rem" }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
