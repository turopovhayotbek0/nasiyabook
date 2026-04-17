import React from "react";
import logo from "../imgs/logo-favicon.svg";
import { colors } from "../styles/colors";
import { useLang } from "../context/LangContext";

export default function Navbar({ current, onChange }) {
  const { t } = useLang();

  const pages = [
    { id: "contacts", label: t.contacts, icon: "fa-solid fa-user-group" },
    // { id: "debts", label: t.debts, icon: "fa-solid fa-hand-holding-dollar" },
    // { id: "payments", label: t.payments, icon: "fa-solid fa-money-bill-wave" },
    { id: "tasks", label: t.tasks, icon: "fa-solid fa-list-check" },
    // { id: "dashboard", label: t.dashboard, icon: "fa-solid fa-chart-column" },
    { id: "reports", label: t.reports, icon: "fa-solid fa-chart-pie" },
  ];

  return (
    <div className="sidebar" style={styles.sidebar}>
      <div className="logo" style={styles.logo}>
        <span className="mainLogo" style={styles.mainLogo}>
          <img src={logo} alt="logo" />
          CashDesk
        </span>
        <span style={styles.logoSub}>{t.personalCRM}</span>
      </div>
      {pages.map((p) => (
        <div
          key={p.id}
          className="nav-item"
          onClick={() => onChange(p.id)}
          style={{
            ...styles.navItem,
            ...(current === p.id ? styles.navActive : {}),
          }}
        >
          <span style={styles.icon}>
            <i className={p.icon}></i>
          </span>
          {p.label}{" "}
          {/* Endi bu yerdagi p.label t dan kelayotgan tarjima bo'ladi */}
        </div>
      ))}
    </div>
  );
}
const styles = {
  sidebar: {
    width: "220px",
    minHeight: "100vh",
    background: colors.navBg,
    display: "flex",
    flexDirection: "column",
    padding: "1.5rem 0",
  },
  logo: {
    padding: "0 1.25rem 1.5rem",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    marginBottom: "1.5rem",
    display: "flex",
    flexDirection: "column",
  },
  mainLogo: {
    alignItems: "center",
    display: "flex",
    color: colors.primaryColor,
    fontWeight: "bold",
    gap: "10px",
  },
  logoText: { fontSize: "18px", fontWeight: "700", color: "#fff" },
  logoSub: {
    fontSize: "12px",
    color: "white",
    marginTop: "2px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 1.25rem",
    fontSize: "14px",
    cursor: "pointer",
    color: colors.textColor,
    borderLeft: "3px solid transparent",
    borderRadius: "0px",
    transition: "all .2s",
    letterSpacing: "0.5px",
  },
  navActive: {
    color: colors.primaryColor,
    borderLeftColor: colors.primaryColor,
    background: colors.primaryBg,
  },
  icon: { fontSize: "16px", width: "20px", textAlign: "center" },
};
