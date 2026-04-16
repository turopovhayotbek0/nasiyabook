import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { colors } from "../styles/colors";
import { useLang } from "../context/LangContext";

export default function Payments() {
  const { data, addPayment } = useApp();
  const { t } = useLang();
  const [showForm, setShowForm] = useState(false);
  const [isDailyPayment, setIsDailyPayment] = useState(false);

  const [form, setForm] = useState({
    debtId: "",
    amount: "",
    date: today(),
    note: "",
  });

  function today() {
    return new Date().toISOString().split("T")[0];
  }

  function fmt(n) {
    return new Intl.NumberFormat("uz-UZ").format(n);
  }

  function getDebtRemaining(debt) {
    if (!debt) return 0;
    const paid = data.payments
      .filter((p) => p.debtId === debt.id)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    return Math.max(0, Number(debt.amount) - paid);
  }

  function handleSave() {
    if (!form.amount) return alert(t.errorEnterAmount);

    if (!isDailyPayment) {
      if (!form.debtId) return alert(t.errorSelectDebt);
      const debt = data.debts.find((d) => d.id === form.debtId);
      const remaining = getDebtRemaining(debt);

      if (Number(form.amount) > remaining)
        return alert(`${t.remaining}: ${fmt(remaining)} ${debt.currency}`);

      addPayment({
        ...form,
        amount: Number(form.amount),
        contactName: debt.contactName,
        currency: debt.currency,
        type: "debt_payment",
      });
    } else {
      addPayment({
        ...form,
        debtId: "daily",
        amount: Number(form.amount),
        contactName: ` ${t.dailyPayment}`,
        currency: "so'm",
        type: "daily_payment",
      });
    }

    setForm({ debtId: "", amount: "", date: today(), note: "" });
    setShowForm(false);
    setIsDailyPayment(false);
  }

  const activeDebts = data.debts.filter((d) => d.status !== "closed");
  const payments = [...data.payments].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>{t.payments}</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            style={{ ...styles.btnPrimary, background: colors.blue }}
            onClick={() => {
              setIsDailyPayment(true);
              setShowForm(true);
            }}
          >
            + {t.dailyPayment}
          </button>
          <button
            style={styles.btnPrimary}
            onClick={() => {
              setIsDailyPayment(false);
              setShowForm(true);
            }}
          >
            + {t.addPayment}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>
            {isDailyPayment ? t.newDailyPayment : t.newPayment}
          </h3>

          <div style={styles.formGrid}>
            {!isDailyPayment ? (
              <div style={{ gridColumn: "span 2" }}>
                <label style={styles.label}>{t.debt} *</label>
                <select
                  style={styles.input}
                  value={form.debtId}
                  onChange={(e) => setForm({ ...form, debtId: e.target.value })}
                >
                  <option value="">{t.selectDebt}...</option>
                  {activeDebts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.contactName} — {fmt(getDebtRemaining(d))} {d.currency}
                    </option>
                  ))}
                </select>
                {form.debtId && (
                  <div style={styles.remainingInfo}>
                    {t.remaining}:{" "}
                    <strong>
                      {fmt(
                        getDebtRemaining(
                          data.debts.find((d) => d.id === form.debtId),
                        ),
                      )}{" "}
                      {data.debts.find((d) => d.id === form.debtId)?.currency}
                    </strong>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ gridColumn: "span 2" }}>
                <label style={styles.label}>{t.dailyPaymentHint}</label>
                <input
                  style={styles.input}
                  placeholder="..."
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>
            )}

            <div>
              <label style={styles.label}>{t.amountPaid} *</label>
              <input
                style={styles.input}
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>{t.colDate}</label>
              <input
                style={styles.input}
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            {!isDailyPayment && (
              <div style={{ gridColumn: "span 2" }}>
                <label style={styles.label}>{t.note}</label>
                <input
                  style={styles.input}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
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
            <button style={styles.btnPrimary} onClick={handleSave}>
              {t.save}
            </button>
          </div>
        </div>
      )}

      <div style={styles.card}>
        {payments.length === 0 ? (
          <p style={styles.empty}>{t.noPayments}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{t.colDate}</th>
                  <th style={styles.th}>
                    {t.person} / {t.paymentType}
                  </th>
                  <th style={styles.th}>{t.amountPaid}</th>
                  <th style={styles.th}>{t.note}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      background:
                        p.type === "daily_payment" ? "#fcfcfc" : "transparent",
                    }}
                  >
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
                  </tr>
                ))}
              </tbody>
            </table>
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
  title: { fontSize: "22px", fontWeight: 600 },
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
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
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
    outline: "none",
  },
  remainingInfo: {
    marginTop: "5px",
    padding: "8px",
    background: "#f0f7ff",
    borderRadius: "6px",
    fontSize: "12px",
    color: "#0056b3",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "12px",
    fontSize: "12px",
    color: colors.textColor,
    borderBottom: `1px solid ${colors.textColor}`,
    fontWeight: 600,
  },
  td: {
    padding: "12px",
    fontSize: "13px",
    borderBottom: `1px solid ${colors.textColor}`,
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
  empty: {
    color: colors.textColor,
    fontSize: "14px",
    textAlign: "center",
    padding: "2rem",
  },
};
