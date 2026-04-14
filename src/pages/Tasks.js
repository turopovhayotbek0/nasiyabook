import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { colors } from "../styles/colors";
import { useLang } from "../context/LangContext";

export default function Tasks() {
  const { data, addTask, deleteItem, updateItem } = useApp();
  const { t } = useLang();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    title: "",
    deadline: today(),
    priority: "medium",
    status: "pending",
    debtId: "",
  });

  function today() {
    return new Date().toISOString().split("T")[0];
  }

  function handleSave() {
    if (!form.title.trim()) return alert("Vazifa nomini kiriting");
    if (!form.title.trim()) return alert(t.enterTaskTitle);
    addTask(form);
    setForm({
      title: "",
      deadline: today(),
      priority: "medium",
      status: "pending",
      debtId: "",
    });
    setShowForm(false);
  }

  function toggleDone(task) {
    updateItem("tasks", task.id, {
      status: task.status === "done" ? "pending" : "done",
    });
  }

  let tasks = [...data.tasks];
  if (filter === "pending") tasks = tasks.filter((t) => t.status === "pending");
  else if (filter === "done") tasks = tasks.filter((t) => t.status === "done");
  else if (filter === "high")
    tasks = tasks.filter((t) => t.priority === "high");

  tasks.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });

  function priorityInfo(p) {
    const map = {
      high: { label: t.high, color: "#c0392b", bg: "#FCEBEB" }, // 4. Status tarjimasi
      medium: { label: t.medium, color: colors.blue, bg: colors.iconBg },
      low: { label: t.low, color: colors.primaryColor, bg: colors.primaryBg },
    };
    return map[p];
  }

  function dotColor(p) {
    return {
      high: "#c0392b",
      medium: colors.blue,
      low: colors.primaryColor,
    }[p];
  }

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>Vazifalar</h2>
        <button style={styles.btnPrimary} onClick={() => setShowForm(true)}>
          {t.addTask}
        </button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>{t.newTask}</h3>
          <div style={styles.formGrid}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={styles.label}>{t.taskTitle} *</label>
              <input
                style={styles.input}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>{t.colDate}</label>
              <input
                style={styles.input}
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>{t.priority}</label>
              <select
                style={styles.input}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="high">{t.high}</option>
                <option value="medium">{t.medium}</option>
                <option value="low">{t.low}</option>
              </select>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={styles.label}>{t.linkToDebt}</label>
              <select
                style={styles.input}
                value={form.debtId}
                onChange={(e) => setForm({ ...form, debtId: e.target.value })}
              >
                <option value="">{t.noLink}</option>
                {data.debts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.contactName} — {d.amount} {d.currency}
                  </option>
                ))}
              </select>
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

      <div style={styles.filterBar}>
        {["all", "pending", "done", "high"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...styles.filterBtn,
              ...(filter === f ? styles.filterActive : {}),
            }}
          >
            {t[f]}
          </button>
        ))}
      </div>

      <div>
        {tasks.length === 0 ? (
          <div style={styles.empty}>{t.noTasks}</div>
        ) : (
          tasks.map((t) => {
            const pri = priorityInfo(t.priority);
            return (
              <div
                key={t.id}
                style={{
                  ...styles.taskCard,
                  opacity: t.status === "done" ? 0.6 : 1,
                }}
              >
                <div style={styles.taskLeft}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: dotColor(t.priority),
                      flexShrink: 0,
                    }}
                  />
                  <input
                    type="checkbox"
                    checked={t.status === "done"}
                    onChange={() => toggleDone(t)}
                    style={{ cursor: "pointer" }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        textDecoration:
                          t.status === "done" ? "line-through" : "none",
                        color: t.status === "done" ? "#aaa" : "#333",
                      }}
                    >
                      {t.title}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#888",
                        marginTop: "2px",
                      }}
                    >
                      {t.colDate}:{t.deadline}
                      {t.debtId && ` · ${t.linkedToDebt}`}
                    </div>
                  </div>
                </div>
                <div style={styles.taskRight}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 500,
                      background: pri.bg,
                      color: pri.color,
                    }}
                  >
                    {pri.label}
                  </span>
                  <button
                    style={styles.btnDanger}
                    onClick={() => deleteItem("tasks", t.id)}
                  >
                    {t.delete || "O'chirish"}
                  </button>
                </div>
              </div>
            );
          })
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
  title: { fontSize: "22px", fontWeight: 600 },
  formCard: {
    background: "white",
    borderRadius: "10px",
    padding: "1.25rem",
    border: `1px solid ${colors.textColor}`,
    marginBottom: "1rem",
  },
  formTitle: { fontSize: "16px", fontWeight: 600, marginBottom: "1rem" },
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
  filterBar: {
    display: "flex",
    gap: "8px",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "5px 14px",
    fontSize: "12px",
    border: `1px solid ${colors.textColor}`,
    borderRadius: "20px",
    cursor: "pointer",
    background: "white",
    color: "black",
  },
  filterActive: {
    background: colors.primaryColor,
    color: "white",
  },
  taskCard: {
    background: "white",
    borderRadius: "10px",
    padding: "1rem 1.25rem",
    border: `1px solid ${colors.textColor}`,
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  taskLeft: { display: "flex", alignItems: "center", gap: "12px" },
  taskRight: { display: "flex", alignItems: "center", gap: "8px" },
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
    color: "#888",
    fontSize: "14px",
    textAlign: "center",
    padding: "3rem",
    background: "white",
    borderRadius: "10px",
    border: `1px solid ${colors.textColor}`,
  },
};
