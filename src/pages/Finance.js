import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { colors } from "../styles/colors";
import { useLang } from "../context/LangContext";

export default function Finance() {
  const { data, addDebt, addPayment, deleteItem, updateItem } = useApp();
  const { t } = useLang();
  const [tab, setTab] = useState("debts");
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("debt");
  const [editDebtId, setEditDebtId] = useState(null);

  const [debtForm, setDebtForm] = useState({
    contactId: "",
    type: "given",
    amount: "",
    currency: "UZS",
    date: today(),
    dueDate: "",
    comment: "",
    status: "active",
  });
  const [payForm, setPayForm] = useState({
    debtId: "",
    amount: "",
    date: today(),
    note: "",
    isDailyPayment: false,
  });

  function today() {
    return new Date().toISOString().split("T")[0];
  }
  function fmt(n) {
    return new Intl.NumberFormat("uz-UZ").format(n);
  }

  function getRemaining(debt) {
    const paid = data.payments
      .filter((p) => p.debtId === debt.id)
      .reduce((s, p) => s + Number(p.amount), 0);
    return Math.max(0, Number(debt.amount) - paid);
  }

  function getStatus(debt) {
    if (getRemaining(debt) === 0) return "closed";
    if (debt.dueDate && debt.dueDate < today()) return "overdue";
    return "active";
  }

  function statusBadge(s) {
    const map = {
      active: { label: t.active, bg: "#E6F1FB", color: colors.primaryColor },
      overdue: { label: t.overdue, bg: "#FCEBEB", color: "#c0392b" },
      closed: { label: t.closed, bg: colors.iconBg, color: colors.blue },
    };
    const st = map[s];
    return (
      <span
        style={{
          padding: "2px 8px",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: 500,
          background: st.bg,
          color: st.color,
        }}
      >
        {st.label}
      </span>
    );
  }

  function saveDebt() {
    if (!debtForm.contactId) return alert(t.selectContactAlert);
    if (!debtForm.amount) return alert(t.enterAmountAlert);
    const contact = data.contacts.find((c) => c.id === debtForm.contactId);
    if (editDebtId) {
      updateItem("debts", editDebtId, {
        ...debtForm,
        amount: Number(debtForm.amount),
        contactName: contact.name,
      });
      setEditDebtId(null);
    } else {
      addDebt({
        ...debtForm,
        amount: Number(debtForm.amount),
        contactName: contact.name,
      });
    }
    setDebtForm({
      contactId: "",
      type: "given",
      amount: "",
      currency: "UZS",
      date: today(),
      dueDate: "",
      comment: "",
      status: "active",
    });
    setShowForm(false);
  }

  function savePayment() {
    if (!payForm.amount) return alert(t.enterAmountAlert);
    if (payForm.isDailyPayment) {
      addPayment({
        ...payForm,
        debtId: "daily",
        contactName: t.dailyPayment,
        currency: "so'm",
        type: "daily_payment",
      });
    } else {
      if (!payForm.debtId) return alert(t.errorSelectDebt);
      const debt = data.debts.find((d) => d.id === payForm.debtId);
      const rem = getRemaining(debt);
      if (Number(payForm.amount) > rem)
        return alert(`${t.remaining}: ${fmt(rem)}`);
      addPayment({
        ...payForm,
        amount: Number(payForm.amount),
        contactName: debt.contactName,
        currency: debt.currency,
        type: "debt_payment",
      });
    }
    setPayForm({
      debtId: "",
      amount: "",
      date: today(),
      note: "",
      isDailyPayment: false,
    });
    setShowForm(false);
  }

  const activeDebts = data.debts.filter((d) => getStatus(d) !== "closed");
  const payments = [...data.payments].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const filteredDebts = data.debts.filter(
    (d) =>
      filter === "all" ||
      getStatus(d) === filter ||
      (filter === "given" && d.type === "given") ||
      (filter === "taken" && d.type === "taken"),
  );

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>{t.finance || "Moliya"}</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          {tab === "debts" && (
            <button
              style={styles.btnPrimary}
              onClick={() => {
                setFormType("debt");
                setEditDebtId(null);
                setShowForm(true);
              }}
            >
              {t.addDebt}
            </button>
          )}
          {tab === "payments" && (
            <>
              <button
                style={{ ...styles.btnPrimary, background: colors.blue }}
                onClick={() => {
                  setFormType("payment");
                  setPayForm({ ...payForm, isDailyPayment: true });
                  setShowForm(true);
                }}
              >
                {t.dailyPayment}
              </button>
              <button
                style={styles.btnPrimary}
                onClick={() => {
                  setFormType("payment");
                  setPayForm({ ...payForm, isDailyPayment: false });
                  setShowForm(true);
                }}
              >
                {t.addPayment}
              </button>
            </>
          )}
        </div>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          {formType === "debt" && (
            <>
              <h3 style={styles.formTitle}>
                {editDebtId ? t.edit : t.newDebt}
              </h3>
              {data.contacts.length === 0 ? (
                <p style={{ color: "#c0392b" }}>{t.firstAddContact}</p>
              ) : (
                <>
                  <div className="form-grid" style={styles.formGrid}>
                    <div>
                      <label style={styles.label}>{t.colPerson} *</label>
                      <select
                        style={styles.input}
                        value={debtForm.contactId}
                        onChange={(e) =>
                          setDebtForm({
                            ...debtForm,
                            contactId: e.target.value,
                          })
                        }
                      >
                        <option value="">{t.selectContact}</option>
                        {data.contacts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={styles.label}>{t.debtType}</label>
                      <select
                        style={styles.input}
                        value={debtForm.type}
                        onChange={(e) =>
                          setDebtForm({ ...debtForm, type: e.target.value })
                        }
                      >
                        <option value="given">{t.menBerdim}</option>
                        <option value="taken">{t.mengaBerishdi}</option>
                      </select>
                    </div>
                    <div>
                      <label style={styles.label}>{t.amount} *</label>
                      <input
                        style={styles.input}
                        type="number"
                        value={debtForm.amount}
                        onChange={(e) =>
                          setDebtForm({ ...debtForm, amount: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label style={styles.label}>{t.currencyVallyuta}</label>
                      <select
                        style={styles.input}
                        value={debtForm.currency}
                        onChange={(e) =>
                          setDebtForm({ ...debtForm, currency: e.target.value })
                        }
                      >
                        <option value="UZS">UZS</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                    <div>
                      <label style={styles.label}>{t.givenDate}</label>
                      <input
                        style={styles.input}
                        type="date"
                        value={debtForm.date}
                        onChange={(e) =>
                          setDebtForm({ ...debtForm, date: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label style={styles.label}>{t.returnDate}</label>
                      <input
                        style={styles.input}
                        type="date"
                        value={debtForm.dueDate}
                        onChange={(e) =>
                          setDebtForm({ ...debtForm, dueDate: e.target.value })
                        }
                      />
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={styles.label}>{t.note}</label>
                      <input
                        style={styles.input}
                        value={debtForm.comment}
                        onChange={(e) =>
                          setDebtForm({ ...debtForm, comment: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div style={styles.formFooter}>
                    <button
                      style={styles.btnSecondary}
                      onClick={() => {
                        setShowForm(false);
                        setEditDebtId(null);
                      }}
                    >
                      {t.cancel}
                    </button>
                    <button style={styles.btnPrimary} onClick={saveDebt}>
                      {t.save}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {formType === "payment" && (
            <>
              <h3 style={styles.formTitle}>
                {payForm.isDailyPayment ? t.newDailyPayment : t.newPayment}
              </h3>
              <div
                style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}
              >
                {/* <button
                  style={{
                    ...styles.filterBtn,
                    ...(payForm.isDailyPayment ? {} : styles.filterActive),
                  }}
                  onClick={() =>
                    setPayForm({ ...payForm, isDailyPayment: false })
                  }
                >
                  {t.debt}
                </button> */}
                {/* <button
                  style={{
                    ...styles.filterBtn,
                    ...(payForm.isDailyPayment ? styles.filterActive : {}),
                  }}
                  onClick={() =>
                    setPayForm({ ...payForm, isDailyPayment: true })
                  }
                >
                  {t.dailyPayment}
                </button> */}
              </div>
              <div className="form-grid" style={styles.formGrid}>
                {!payForm.isDailyPayment && (
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={styles.label}>{t.debt} *</label>
                    <select
                      style={styles.input}
                      value={payForm.debtId}
                      onChange={(e) =>
                        setPayForm({ ...payForm, debtId: e.target.value })
                      }
                    >
                      <option value="">{t.selectDebt}</option>
                      {activeDebts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.contactName} — {fmt(getRemaining(d))} {d.currency}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {payForm.isDailyPayment && (
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={styles.label}>{t.note}</label>
                    <input
                      style={styles.input}
                      value={payForm.note}
                      onChange={(e) =>
                        setPayForm({ ...payForm, note: e.target.value })
                      }
                    />
                  </div>
                )}
                <div>
                  <label style={styles.label}>{t.amountPaid} *</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={payForm.amount}
                    onChange={(e) =>
                      setPayForm({ ...payForm, amount: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={styles.label}>{t.colDate}</label>
                  <input
                    style={styles.input}
                    type="date"
                    value={payForm.date}
                    onChange={(e) =>
                      setPayForm({ ...payForm, date: e.target.value })
                    }
                  />
                </div>
                {!payForm.isDailyPayment && (
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={styles.label}>{t.note}</label>
                    <input
                      style={styles.input}
                      value={payForm.note}
                      onChange={(e) =>
                        setPayForm({ ...payForm, note: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>
              <div style={styles.formFooter}>
                <button
                  style={styles.btnSecondary}
                  onClick={() => setShowForm(false)}
                >
                  {t.cancel}
                </button>
                <button style={styles.btnBlue} onClick={savePayment}>
                  {t.save}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div style={styles.tabs}>
        {[
          ["debts", t.debts],
          ["payments", t.payments],
        ].map(([id, label]) => (
          <div
            key={id}
            onClick={() => setTab(id)}
            style={{ ...styles.tab, ...(tab === id ? styles.tabActive : {}) }}
          >
            {label}
          </div>
        ))}
      </div>

      {tab === "debts" && (
        <>
          <div style={styles.filterBar}>
            {["all", "active", "overdue", "closed", "given", "taken"].map(
              (f) => (
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
              ),
            )}
          </div>
          <div style={styles.card}>
            {filteredDebts.length === 0 ? (
              <p style={styles.empty}>{t.noDebts}</p>
            ) : (
              <>
                <div className="desktop-only">
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>{t.colPerson}</th>
                        <th style={styles.th}>{t.debtType}</th>
                        <th style={styles.th}>{t.amount}</th>
                        <th style={styles.th}>{t.givenDate}</th>
                        <th style={styles.th}>{t.returnDate}</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>{t.colRemaining}</th>
                        <th style={styles.th}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDebts.map((d) => (
                        <tr key={d.id}>
                          <td style={styles.td}>{d.contactName}</td>
                          <td style={styles.td}>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: 500,
                                background:
                                  d.type === "given" ? "#E6F1FB" : "#FAEEDA",
                                color:
                                  d.type === "given"
                                    ? colors.primaryColor
                                    : "#854F0B",
                              }}
                            >
                              {d.type === "given" ? t.given : t.taken}
                            </span>
                          </td>
                          <td style={styles.td}>
                            {fmt(d.amount)} {d.currency}
                          </td>
                          <td style={styles.td}>{d.date}</td>
                          <td style={styles.td}>{d.dueDate || "—"}</td>
                          <td style={styles.td}>{statusBadge(getStatus(d))}</td>
                          <td
                            style={{
                              ...styles.td,
                              fontWeight: 500,
                              color: colors.primaryColor,
                            }}
                          >
                            {fmt(getRemaining(d))} {d.currency}
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                style={styles.btnEdit}
                                onClick={() => {
                                  setDebtForm({
                                    contactId: d.contactId || "",
                                    type: d.type,
                                    amount: d.amount,
                                    currency: d.currency,
                                    date: d.date,
                                    dueDate: d.dueDate || "",
                                    comment: d.comment || "",
                                    status: d.status,
                                  });
                                  setEditDebtId(d.id);
                                  setFormType("debt");
                                  setShowForm(true);
                                }}
                              >
                                {t.edit}
                              </button>
                              {getStatus(d) !== "closed" && (
                                <button
                                  style={styles.btnClose}
                                  onClick={() =>
                                    updateItem("debts", d.id, {
                                      status: "closed",
                                    })
                                  }
                                >
                                  {t.close}
                                </button>
                              )}
                              <button
                                style={styles.btnDanger}
                                onClick={() => deleteItem("debts", d.id)}
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
                <div className="mobile-only">
                  {filteredDebts.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        borderBottom: "1px solid #f0f0f0",
                        padding: "12px 0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>{d.contactName}</span>
                        <span
                          style={{
                            fontWeight: 600,
                            color: colors.primaryColor,
                          }}
                        >
                          {fmt(d.amount)} {d.currency}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        {statusBadge(getStatus(d))}
                        <span style={{ fontSize: "12px", color: "#888" }}>
                          {t.colRemaining}: {fmt(getRemaining(d))}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          style={styles.btnEdit}
                          onClick={() => {
                            setDebtForm({
                              contactId: d.contactId || "",
                              type: d.type,
                              amount: d.amount,
                              currency: d.currency,
                              date: d.date,
                              dueDate: d.dueDate || "",
                              comment: d.comment || "",
                              status: d.status,
                            });
                            setEditDebtId(d.id);
                            setFormType("debt");
                            setShowForm(true);
                          }}
                        >
                          {t.edit}
                        </button>
                        {getStatus(d) !== "closed" && (
                          <button
                            style={styles.btnClose}
                            onClick={() =>
                              updateItem("debts", d.id, { status: "closed" })
                            }
                          >
                            {t.close}
                          </button>
                        )}
                        <button
                          style={styles.btnDanger}
                          onClick={() => deleteItem("debts", d.id)}
                        >
                          {t.delete}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {tab === "payments" && (
        <div style={styles.card}>
          {payments.length === 0 ? (
            <p style={styles.empty}>{t.noPayments}</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>{t.colDate}</th>
                    <th style={styles.th}>{t.colPerson}</th>
                    <th style={styles.th}>{t.amountPaid}</th>
                    <th style={styles.th}>{t.note}</th>
                    <th style={styles.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td style={styles.td}>{p.date}</td>
                      <td style={styles.td}>
                        {p.type === "daily_payment" ? (
                          <i>{p.contactName}</i>
                        ) : (
                          p.contactName
                        )}
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          fontWeight: 600,
                          color:
                            p.type === "daily_payment"
                              ? colors.blue
                              : colors.primaryColor,
                        }}
                      >
                        {fmt(p.amount)} {p.currency}
                      </td>
                      <td style={styles.td}>{p.note || "—"}</td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            style={styles.btnEdit}
                            onClick={() => {
                              setPayForm({
                                debtId: p.debtId === "daily" ? "" : p.debtId,
                                amount: p.amount,
                                date: p.date,
                                note: p.note || "",
                                isDailyPayment: p.type === "daily_payment",
                              });
                              setFormType("payment");
                              setShowForm(true);
                              deleteItem("payments", p.id);
                            }}
                          >
                            {t.edit}
                          </button>
                          <button
                            style={styles.btnDanger}
                            onClick={() => deleteItem("payments", p.id)}
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
          )}
        </div>
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
  tabs: {
    display: "flex",
    borderBottom: "2px solid #eee",
    marginBottom: "1rem",
  },
  tab: {
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#888",
    borderBottom: "2px solid transparent",
    marginBottom: "-2px",
  },
  tabActive: {
    color: colors.primaryColor,
    borderBottomColor: colors.primaryColor,
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
  card: {
    background: "white",
    borderRadius: "10px",
    padding: "1.25rem",
    border: "1px solid #eee",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "8px 12px",
    fontSize: "12px",
    color: "#888",
    borderBottom: "1px solid #eee",
    fontWeight: 500,
  },
  td: {
    padding: "8px 12px",
    fontSize: "13px",
    borderBottom: "1px solid #f5f5f5",
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
  btnClose: {
    padding: "4px 10px",
    background: colors.primaryBg,
    color: colors.primaryColor,
    border: `1px solid ${colors.primaryColor}`,
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
  },
  btnBlue: {
    padding: "8px 16px",
    background: colors.blue,
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
