import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { colors } from "../styles/colors";
import { useLang } from "../context/LangContext";

export default function Contacts() {
  const { data, addContact, deleteItem, updateItem } = useApp();
  const { t } = useLang();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "+998",
    tg: "@",
    note: "",
  });

  function handleSave() {
    if (!form.name.trim()) return alert(t.nameRequired);
    if (editId) {
      updateItem("contacts", editId, form);
      setEditId(null);
    } else {
      addContact(form);
    }
    setForm({ name: "", phone: "+998", tg: "@", note: "" });
    setShowForm(false);
  }

  function handleEdit(c) {
    setForm({
      name: c.name,
      phone: c.phone || "+998",
      tg: c.tg || "@",
      note: c.note || "",
    });
    setEditId(c.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancel() {
    setForm({ name: "", phone: "+998", tg: "@", note: "" });
    setEditId(null);
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

  function handlePhoneChange(e) {
    let value = e.target.value.replace(/\D/g, "");
    if (!value.startsWith("998")) value = "998" + value;
    const raw = value;
    let formatted = "+998 ";
    if (value.length > 3) formatted += value.slice(3, 5);
    if (value.length >= 6) formatted += " " + value.slice(5, 8);
    if (value.length >= 9) formatted += " " + value.slice(8, 10);
    if (value.length >= 11) formatted += " " + value.slice(10, 12);
    setForm({ ...form, phone: formatted, phoneRaw: raw });
  }

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>{t.contacts}</h2>
        <button
          style={styles.btnPrimary}
          onClick={() => {
            setEditId(null);
            setForm({ name: "", phone: "+998", tg: "@", note: "" });
            setShowForm(true);
          }}
        >
          {t.addContact}
        </button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>
            {editId ? t.editContact || "Kontaktni tahrirlash" : t.newContact}
          </h3>
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
                type="text"
                value={form.phone}
                placeholder="+998 90 123 45 67"
                onChange={handlePhoneChange}
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
              <label style={styles.label}>{t.note}</label>
              <input
                style={styles.input}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
          </div>
          <div style={styles.formFooter}>
            <button style={styles.btnSecondary} onClick={handleCancel}>
              {t.cancel}
            </button>
            <button style={styles.btnPrimary} onClick={handleSave}>
              {editId ? t.save : t.save}
            </button>
          </div>
        </div>
      )}

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
                          <div style={styles.avatar}>{getInitials(c.name)}</div>
                          <span style={{ fontWeight: 500 }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={styles.td}>{c.phone || "—"}</td>
                      <td style={styles.td}>{c.tg || "—"}</td>
                      <td style={styles.td}>{c.note || "—"}</td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            style={styles.btnEdit}
                            onClick={() => handleEdit(c)}
                          >
                            {t.edit}
                          </button>
                          <button
                            style={styles.btnDanger}
                            onClick={() => deleteItem("contacts", c.id)}
                          >
                            {t.delete}
                          </button>
                        </div>
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
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        style={styles.btnEdit}
                        onClick={() => handleEdit(c)}
                      >
                        ✏️
                      </button>
                      <button
                        style={styles.btnDanger}
                        onClick={() => deleteItem("contacts", c.id)}
                      >
                        {t.delete}
                      </button>
                    </div>
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
    background: "white",
    color: "black",
    border: `1px solid ${colors.textColor}`,
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  btnEdit: {
    padding: "4px 10px",
    background: colors.iconBg,
    color: colors.blue,
    border: "1px solid #c0d8f5",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
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
