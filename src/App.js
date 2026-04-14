import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Debts from "./pages/Debts";
import Tasks from "./pages/Tasks";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";

export default function App() {
  const [page, setPage] = useState("dashboard");

  function renderPage() {
    switch (page) {
      case "dashboard":
        return <Dashboard />;
      case "contacts":
        return <Contacts />;
      case "debts":
        return <Debts />;
      case "tasks":
        return <Tasks />;
      case "payments":
        return <Payments />;
      case "reports":
        return <Reports />;
      default:
        return (
          <div>
            <h2>{page}</h2>
          </div>
        );
    }
  }

  return (
    <div
      className="app-layout"
      style={{ display: "flex", minHeight: "100vh", background: "#f0f2f5" }}
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
