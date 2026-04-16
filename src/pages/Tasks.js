import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { colors } from "../styles/colors";
import { useLang } from "../context/LangContext";

export default function Tasks() {
  const { data, addTask, deleteItem, updateItem } = useApp();
  const { t: lang } = useLang();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    title: "",
    deadline: today(),
    priority: "medium",
    status: "pending",
    debtId: "",
    category: "general",
  });

  const selectedDebt = useMemo(() => {
    return data.debts.find((d) => d.id === form.debtId);
  }, [form.debtId, data.debts]);

  function today() {
    return new Date().toISOString().split("T")[0];
  }

  function handleSave() {
    if (!form.title.trim()) return alert(lang.enterTaskTitle);
    addTask(form);
    setForm({
      title: "",
      deadline: today(),
      priority: "medium",
      status: "pending",
      debtId: "",
      category: "general",
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
      high: { label: lang.high, color: "#c0392b", bg: "#FCEBEB" },
      medium: { label: lang.medium, color: colors.blue, bg: colors.iconBg },
      low: {
        label: lang.low,
        color: colors.primaryColor,
        bg: colors.primaryBg,
      },
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
        <h2 style={styles.title}>{lang.task}</h2>
        <button style={styles.btnPrimary} onClick={() => setShowForm(true)}>
          {lang.addTask}
        </button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>{lang.newTask}</h3>
          <div style={styles.formGrid}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={styles.label}>{lang.taskTitle} *</label>
              <input
                style={styles.input}
                placeholder=""
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>{lang.colDate}</label>
              <input
                style={styles.input}
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>{lang.priority}</label>
              <select
                style={styles.input}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="high">{lang.high}</option>
                <option value="medium">{lang.medium}</option>
                <option value="low">{lang.low}</option>
              </select>
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={styles.label}>{lang.linkToDebt}</label>
              <select
                style={styles.input}
                value={form.debtId}
                onChange={(e) => setForm({ ...form, debtId: e.target.value })}
              >
                <option value="">{lang.noLink} (Oddiy vazifa)</option>
                {data.debts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.contactName} — {d.amount} {d.currency}
                  </option>
                ))}
              </select>

              {!form.debtId ? (
                <div style={styles.noDebtBox}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "#666" }}>
                      {lang.todoType}
                    </span>
                    <button
                      style={styles.quickAddLink}
                      onClick={() => alert("Qarzlar bo'limiga o'ting")}
                    >
                      + Yangi qarzdor
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: "5px" }}>
                    {["personal", "market", "meeting", "payment"].map((key) => (
                      <button
                        key={key}
                        onClick={() =>
                          setForm({
                            ...form,
                            title: `${lang[key]}: ${form.title}`,
                          })
                        }
                        style={styles.miniTag}
                      >
                        {lang[key]}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={styles.debtPreview}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: colors.blue,
                      fontSize: "13px",
                    }}
                  >
                    🔗 {selectedDebt.contactName} bilan bog'landi
                  </div>
                  <div style={{ fontSize: "12px", color: "#555" }}>
                    Joriy qarz miqdori:{" "}
                    <b>
                      {selectedDebt.amount} {selectedDebt.currency}
                    </b>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={styles.formFooter}>
            <button
              style={styles.btnSecondary}
              onClick={() => setShowForm(false)}
            >
              {lang.cancel}
            </button>
            <button style={styles.btnPrimary} onClick={handleSave}>
              {lang.save}
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
            {lang[f]}
          </button>
        ))}
      </div>

      <div>
        {tasks.length === 0 ? (
          <div style={styles.empty}>{lang.noTasks}</div>
        ) : (
          tasks.map((task) => {
            const pri = priorityInfo(task.priority);
            const taskDebt = data.debts.find((d) => d.id === task.debtId);

            return (
              <div
                key={task.id}
                style={{
                  ...styles.taskCard,
                  opacity: task.status === "done" ? 0.6 : 1,
                }}
              >
                <div style={styles.taskLeft}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: dotColor(task.priority),
                      flexShrink: 0,
                    }}
                  />
                  <input
                    type="checkbox"
                    checked={task.status === "done"}
                    onChange={() => toggleDone(task)}
                    style={{ cursor: "pointer" }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        textDecoration:
                          task.status === "done" ? "line-through" : "none",
                        color: task.status === "done" ? "#aaa" : "#333",
                      }}
                    >
                      {task.title}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#888",
                        marginTop: "2px",
                      }}
                    >
                      {lang.colDate}: {task.deadline}
                      {taskDebt && (
                        <span style={{ color: colors.blue }}>
                          {" "}
                          · 🔗 {taskDebt.contactName}
                        </span>
                      )}
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
                    onClick={() => deleteItem("tasks", task.id)}
                  >
                    {lang.remove}
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
    border: `1px solid ${colors.textColor || "#eee"}`,
    marginBottom: "1rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
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
    color: "#555",
    display: "block",
    marginBottom: "4px",
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    fontSize: "13px",
    border: `1px solid #ccc`,
    borderRadius: "6px",
    boxSizing: "border-box",
  },
  // Yangi qo'shilgan: Bog'lanmagan holat stili
  noDebtBox: {
    marginTop: "10px",
    padding: "10px",
    background: "#f9f9f9",
    borderRadius: "6px",
    border: "1px dashed #ddd",
  },
  quickAddLink: {
    background: "none",
    border: "none",
    color: colors.primaryColor,
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "underline",
  },
  miniTag: {
    padding: "3px 8px",
    fontSize: "10px",
    background: "white",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    color: "#666",
  },
  debtPreview: {
    marginTop: "8px",
    padding: "10px 12px",
    background: "#f0f7ff",
    borderRadius: "6px",
    borderLeft: `4px solid ${colors.blue}`,
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
    border: `1px solid #ccc`,
    borderRadius: "20px",
    cursor: "pointer",
    background: "white",
    color: "black",
  },
  filterActive: {
    background: colors.primaryColor,
    color: "white",
    border: `1px solid ${colors.primaryColor}`,
  },
  taskCard: {
    background: "white",
    borderRadius: "10px",
    padding: "1rem 1.25rem",
    border: `1px solid #eee`,
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
    border: `1px solid #eee`,
  },
};
