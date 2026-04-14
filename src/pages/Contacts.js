import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { colors } from "../styles/colors";
import { useLang } from "../context/LangContext";

export default function Contacts() {
  const { data, addContact, deleteItem } = useApp();
  const { t } = useLang();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", tg: "", note: "" });

  function handleSave() {
    if (!form.name.trim()) return alert(t.nameRequired);
    addContact(form);
    setForm({ name: "", phone: "", tg: "", note: "" });
    setShowForm(false);
  }

  function getInitials(name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>{t.contacts}</h2>
        <button style={styles.btnPrimary} onClick={() => setShowForm(true)}>
          {t.addContact}
        </button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>{t.newContact}</h3>
          <div className="form-grid" style={styles.formGrid}>
            <div>
              <label style={styles.label}>{t.name}*</label>
              <input
                style={styles.input}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>{t.phone}</label>
              <input
                style={styles.input}
                value={form.phone}
                placeholder="+998901234567"
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>{t.telegram}</label>
              <input
                style={styles.input}
                value={form.tg}
                placeholder="@username"
                onChange={(e) => setForm({ ...form, tg: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>{t.note} </label>
              <input
                style={styles.input}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
          </div>
          <div style={styles.formFooter}>
            <button
              style={styles.btnSecondary}
              onClick={() => setShowForm(false)}
            >
              {t.cancel}
            </button>
            <button style={styles.btnPrimary} onClick={handleSave}>
              {t.save}
            </button>
          </div>
        </div>
      )}

      <div style={styles.card}>
        {data.contacts.length === 0 ? (
          <p style={styles.empty}>{t.noContacts}</p>
        ) : (
          <div style={styles.card}>
            {data.contacts.length === 0 ? (
              <p style={styles.empty}>{t.noContacts}</p>
            ) : (
              <>
                {/* Desktop table */}
                <div className="desktop-only">
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>{t.name}</th>
                        <th style={styles.th}>{t.phone}</th>
                        <th style={styles.th}>{t.telegram}</th>
                        <th style={styles.th}>{t.note}</th>
                        <th style={styles.th}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.contacts.map((c) => (
                        <tr key={c.id}>
                          <td style={styles.td}>
                            <div style={styles.contactRow}>
                              <div style={styles.avatar}>
                                {getInitials(c.name)}
                              </div>
                              <span style={{ fontWeight: 500 }}>{c.name}</span>
                            </div>
                          </td>
                          <td style={styles.td}>{c.phone || "—"}</td>
                          <td style={styles.td}>{c.tg || "—"}</td>
                          <td style={styles.td}>{c.note || "—"}</td>
                          <td style={styles.td}>
                            <button
                              style={styles.btnDanger}
                              onClick={() => deleteItem("contacts", c.id)}
                            >
                              {t.delete}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="mobile-only">
                  {data.contacts.map((c) => (
                    <div key={c.id} style={styles.mobileCard}>
                      <div style={styles.mobileTop}>
                        <div style={styles.contactRow}>
                          <div style={styles.avatar}>{getInitials(c.name)}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "14px" }}>
                              {c.name}
                            </div>
                            <div style={{ fontSize: "12px", color: "#888" }}>
                              {c.phone || "—"}
                            </div>
                          </div>
                        </div>
                        <button
                          style={styles.btnDanger}
                          onClick={() => deleteItem("contacts", c.id)}
                        >
                          O'chir
                        </button>
                      </div>
                      <div style={styles.mobileRow}>
                        <span style={styles.mobileLabel}>{t.telegram}</span>
                        <span>{c.tg || "—"}</span>
                      </div>
                      <div style={styles.mobileRow}>
                        <span style={styles.mobileLabel}>{t.note}</span>
                        <span>{c.note || "—"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  title: { fontSize: "22px", fontWeight: 600, color: "black" },
  card: {
    background: "white",
    borderRadius: "10px",
    padding: "1.25rem",
    border: `1px solid ${colors.textColor}`,
  },
  formCard: {
    background: "white",
    borderRadius: "10px",
    padding: "1.25rem",
    border: `1px solid ${colors.textColor}`,
    marginBottom: "1rem",
  },
  formTitle: {
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "1rem",
    color: "black",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1rem",
  },
  formFooter: { display: "flex", gap: "8px", justifyContent: "flex-end" },
  label: {
    fontSize: "12px",
    fontWeight: 500,
    color: colors.textColor,
    display: "block",
    marginBottom: "4px",
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    fontSize: "13px",
    border: `1px solid ${colors.textColor}`,
    borderRadius: "6px",
    boxSizing: "border-box",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "8px 12px",
    fontSize: "12px",
    color: colors.textColor,
    borderBottom: `1px solid ${colors.textColor}`,
    fontWeight: 500,
  },
  td: {
    padding: "10px 12px",
    fontSize: "13px",
    borderBottom: `1px solid ${colors.textColor}`,
  },
  contactRow: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: colors.primaryBg,
    display: "flex",
    alignItems: "center",
    border: `0.5px solid ${colors.primaryColor}`,
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 600,
    color: colors.primaryColor,
  },
  btnPrimary: {
    padding: "8px 16px",
    background: colors.primaryColor,
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
  },
  btnSecondary: {
    padding: "8px 16px",
    background: colors.iconBg,
    color: colors.textColor,
    border: `1px solid ${colors.textColor}`,
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  btnDanger: {
    padding: "4px 10px",
    background: "#fff0f0",
    color: "#c0392b",
    border: "1px solid #fcc",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  empty: {
    color: colors.textColor,
    fontSize: "14px",
    textAlign: "center",
    padding: "2rem",
  },
  mobileCard: {
    borderBottom: `1px solid ${colors.textColor}`,
    padding: "12px",
    marginBottom: "8px",
  },
  mobileTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  mobileRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    padding: "4px 0",
    borderTop: `1px solid ${colors.textColor}`,
  },
  mobileLabel: { color: colors.iconColor, fontSize: "12px" },
};
