import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { colors } from "../styles/colors";
import { useLang } from "../context/LangContext";

export default function Topbar({ onNavigate }) {
  const { data } = useApp();
  const { lang, changeLang, t } = useLang(); // t obyekti bu yerda tarjimalarni tutadi
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);
  const [showLang, setShowLang] = useState(false);

  const langFlags = { uz: "🇺🇿 UZ", ru: "🇷🇺 RU", en: "🇺🇸 EN" };

  function handleSearch(q) {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      setShow(false);
      return;
    }
    const ql = q.toLowerCase();

    const contacts = data.contacts
      .filter(
        (c) =>
          c.name.toLowerCase().includes(ql) ||
          c.phone?.includes(ql) ||
          c.tg?.toLowerCase().includes(ql),
      )
      .map((c) => ({
        type: "contact",
        label: c.name,
        sub: c.phone || "",
        page: "contacts",
      }));

    const debts = data.debts
      .filter(
        (d) =>
          d.contactName?.toLowerCase().includes(ql) ||
          String(d.amount).includes(ql),
      )
      .map((d) => ({
        type: "debt",
        label: d.contactName + " — " + d.amount + " " + d.currency,
        sub: d.date,
        page: "debts",
      }));

    const tasks = data.tasks
      .filter((t) => t.title.toLowerCase().includes(ql))
      .map((t) => ({
        type: "task",
        label: t.title,
        sub: t.deadline,
        page: "tasks",
      }));

    setResults([...contacts, ...debts, ...tasks].slice(0, 8));
    setShow(true);
  }

  function handleSelect(item) {
    onNavigate(item.page);
    setQuery("");
    setResults([]);
    setShow(false);
  }

  function typeIcon(type) {
    return type === "contact" ? "◎" : type === "debt" ? "⊟" : "◻";
  }

  function typeColor(type) {
    return type === "contact"
      ? colors.primaryColor
      : type === "debt"
        ? "#854F0B"
        : colors.iconColor;
  }

  return (
    <div style={styles.topbar}>
      <div style={styles.searchWrap}>
        <input
          style={styles.searchInput}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onBlur={() => setTimeout(() => setShow(false), 200)}
          onFocus={() => query && setShow(true)}
          placeholder={t.search}
        />
        {show && results.length > 0 && (
          <div style={styles.dropdown}>
            {results.map((r, i) => (
              <div
                key={i}
                style={styles.dropdownItem}
                onClick={() => handleSelect(r)}
              >
                <span style={{ color: typeColor(r.type), fontSize: "14px" }}>
                  {typeIcon(r.type)}
                </span>
                <div>
                  <div style={styles.dropdownLabel}>{r.label}</div>
                  <div style={styles.dropdownSub}>{r.sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {show && results.length === 0 && query && (
          <div style={styles.dropdown}>
            {/* 2. No Data xabarini dinamik qildik */}
            <div style={styles.noResult}>{t.noData}</div>
          </div>
        )}
      </div>

      <div style={{ position: "relative", marginLeft: "auto" }}>
        <button
          style={styles.langBtn}
          onClick={() => setShowLang(!showLang)}
          onBlur={() => setTimeout(() => setShowLang(false), 200)}
        >
          {langFlags[lang]} ▾
        </button>
        {showLang && (
          <div style={styles.langDropdown}>
            {Object.entries(langFlags).map(([key, label]) => (
              <div
                key={key}
                style={{
                  ...styles.langItem,
                  ...(lang === key ? styles.langActive : {}),
                }}
                onClick={() => {
                  changeLang(key);
                  setShowLang(false);
                }}
              >
                {label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  topbar: {
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    background: "white",
    borderBottom: `1px solid ${colors.iconBg}`,
    padding: ".75rem 2rem",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  searchWrap: { position: "relative", width: "400px" },
  searchInput: {
    width: "100%",
    padding: "8px 14px",
    fontSize: "13px",
    border: `1px solid ${colors.textColor}`,
    borderRadius: "8px",
    background: "white",
    outline: "none",
    boxSizing: "border-box",
  },
  dropdown: {
    position: "absolute",
    top: "110%",
    left: 0,
    right: 0,
    background: "white",
    border: `1px solid ${colors.textColor}`,
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    zIndex: 100,
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    cursor: "pointer",
    borderBottom: `1px solid ${colors.textColor}`,
  },
  dropdownLabel: { fontSize: "13px", fontWeight: 500, color: "#333" },
  dropdownSub: { fontSize: "11px", color: colors.iconColor, marginTop: "1px" },
  noResult: {
    padding: "14px",
    fontSize: "13px",
    color: colors.iconColor,
    textAlign: "center",
  },
  langBtn: {
    whiteSpace: "nowrap",
    padding: "7px 14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
  },
  langDropdown: {
    position: "absolute",
    right: 0,
    top: "110%",
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    zIndex: 100,
    minWidth: "120px",
  },
  langItem: {
    padding: "10px 16px",
    fontSize: "13px",
    cursor: "pointer",
    color: "#333",
  },
  langActive: {
    background: colors.primaryBg,
    color: colors.primaryColor,
    fontWeight: 500,
  },
};
