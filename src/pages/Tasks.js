import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { colors } from "../styles/colors";
import { useLang } from "../context/LangContext";

export default function Tasks() {
  const { data, addTask, deleteItem, updateItem } = useApp();
  const { t } = useLang();
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    deadline: today(),
    priority: "medium",
    status: "pending",
    debtId: "",
  });

  function today() {
    return new Date().toISOString().split("T")[0];
  }
  function fmt(n) {
    return new Intl.NumberFormat("uz-UZ").format(n);
  }

  function saveTask() {
    if (!taskForm.title.trim()) return alert(t.enterTaskTitle);
    if (editTaskId) {
      updateItem("tasks", editTaskId, taskForm);
      setEditTaskId(null);
    } else {
      addTask(taskForm);
    }
    setTaskForm({
      title: "",
      deadline: today(),
      priority: "medium",
      status: "pending",
      debtId: "",
    });
    setShowForm(false);
  }

  let tasks = [...data.tasks];
  if (filter === "pending") tasks = tasks.filter((t) => t.status === "pending");
  else if (filter === "done") tasks = tasks.filter((t) => t.status === "done");
  else if (filter === "high")
    tasks = tasks.filter((t) => t.priority === "high");
  tasks.sort(
    (a, b) =>
      ({ high: 0, medium: 1, low: 2 })[a.priority] -
      { high: 0, medium: 1, low: 2 }[b.priority],
  );

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>{t.tasks}</h2>
        <button
          style={styles.btnPrimary}
          onClick={() => {
            setEditTaskId(null);
            setTaskForm({
              title: "",
              deadline: today(),
              priority: "medium",
              status: "pending",
              debtId: "",
            });
            setShowForm(true);
          }}
        >
          {t.addTask}
        </button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>{editTaskId ? t.edit : t.newTask}</h3>
          <div className="form-grid" style={styles.formGrid}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={styles.label}>{t.taskTitle} *</label>
              <input
                style={styles.input}
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, title: e.target.value })
                }
              />
            </div>
            <div>
              <label style={styles.label}>{t.colDate}</label>
              <input
                style={styles.input}
                type="date"
                value={taskForm.deadline}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, deadline: e.target.value })
                }
              />
            </div>
            <div>
              <label style={styles.label}>{t.priority}</label>
              <select
                style={styles.input}
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, priority: e.target.value })
                }
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
                value={taskForm.debtId}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, debtId: e.target.value })
                }
              >
                <option value="">{t.noLink}</option>
                {data.debts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.contactName} — {fmt(d.amount)} {d.currency}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={styles.formFooter}>
            <button
              style={styles.btnSecondary}
              onClick={() => {
                setShowForm(false);
                setEditTaskId(null);
              }}
            >
              {t.cancel}
            </button>
            <button style={styles.btnPrimary} onClick={saveTask}>
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

      {tasks.length === 0 ? (
        <div style={styles.empty}>{t.noTasks}</div>
      ) : (
        tasks.map((task) => {
          const pri = {
            high: { label: t.high, color: "#c0392b", bg: "#FCEBEB" },
            medium: { label: t.medium, color: colors.blue, bg: colors.iconBg },
            low: {
              label: t.low,
              color: colors.primaryColor,
              bg: colors.primaryBg,
            },
          }[task.priority];
          const taskDebt = data.debts.find((d) => d.id === task.debtId);
          return (
            <div
              key={task.id}
              className="task-card"
              style={{
                ...styles.taskCard,
                opacity: task.status === "done" ? 0.6 : 1,
              }}
            >
              <div className="task-left" style={styles.taskLeft}>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: pri.color,
                    flexShrink: 0,
                  }}
                />
                <input
                  type="checkbox"
                  checked={task.status === "done"}
                  onChange={() =>
                    updateItem("tasks", task.id, {
                      status: task.status === "done" ? "pending" : "done",
                    })
                  }
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
                    {t.colDate}: {task.deadline}
                    {taskDebt && (
                      <span style={{ color: colors.blue }}>
                        {" "}
                        · {taskDebt.contactName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="task-right" style={styles.taskRight}>
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
                  style={styles.btnEdit}
                  onClick={() => {
                    setTaskForm({
                      title: task.title,
                      deadline: task.deadline,
                      priority: task.priority,
                      status: task.status,
                      debtId: task.debtId || "",
                    });
                    setEditTaskId(task.id);
                    setShowForm(true);
                  }}
                >
                  {t.edit}
                </button>
                <button
                  style={styles.btnDanger}
                  onClick={() => deleteItem("tasks", task.id)}
                >
                  {t.delete}
                </button>
              </div>
            </div>
          );
        })
      )}
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
  filterBar: {
    display: "flex",
    gap: "8px",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "5px 14px",
    fontSize: "12px",
    border: "1px solid #ddd",
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
  formCard: {
    background: "white",
    borderRadius: "10px",
    padding: "1.25rem",
    border: "1px solid #eee",
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
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box",
  },
  taskCard: {
    background: "white",
    borderRadius: "10px",
    padding: "1rem 1.25rem",
    border: "1px solid #eee",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "8px",
  },
  taskLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
    minWidth: 0,
  },
  taskRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
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
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  btnEdit: {
    padding: "4px 10px",
    background: colors.iconBg,
    color: colors.blue,
    border: `1px solid ${colors.blue}`,
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
    color: "#888",
    fontSize: "14px",
    textAlign: "center",
    padding: "3rem",
    background: "white",
    borderRadius: "10px",
    border: "1px solid #eee",
  },
};
