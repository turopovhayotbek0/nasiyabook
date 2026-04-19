import React from "react";
import { useApp } from "../context/AppContext";
import { colors } from "../styles/colors";
import { useLang } from "../context/LangContext";

export default function Reports() {
  const { data, monthlyIn, monthlyOut } = useApp();
  const { t } = useLang();
  const fmt = (n) => new Intl.NumberFormat("uz-UZ").format(n);

  function getRemaining(debt) {
    const paid = data.payments
      .filter((p) => p.debtId === debt.id)
      .reduce((s, p) => s + Number(p.amount), 0);
    return Math.max(0, Number(debt.amount) - paid);
  }

  function getStatus(debt) {
    const today = new Date().toISOString().split("T")[0];
    if (getRemaining(debt) === 0) return "closed";
    if (debt.dueDate && debt.dueDate < today) return "overdue";
    return "active";
  }

  const totalDaily = data.payments
    .filter((p) => p.type === "daily_payment")
    .reduce((s, p) => s + Number(p.amount), 0);

  const activeCount = data.debts.filter(
    (d) => getStatus(d) === "active",
  ).length;
  const overdueCount = data.debts.filter(
    (d) => getStatus(d) === "overdue",
  ).length;
  const closedCount = data.debts.filter(
    (d) => getStatus(d) === "closed",
  ).length;

  const byContact = {};
  data.debts
    .filter((d) => d.type === "given")
    .forEach((d) => {
      byContact[d.contactName] =
        (byContact[d.contactName] || 0) + getRemaining(d);
    });
  const topDebtors = Object.entries(byContact)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const recentPayments = [...data.payments]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);
  const overdueDebts = data.debts.filter((d) => getStatus(d) === "overdue");

  function exportCSV() {
    const rows = [
      [
        t.colPerson,
        t.debtType,
        t.amount,
        t.colRemaining,
        t.givenDate,
        t.returnDate,
        "Status",
      ],
      ...data.debts.map((d) => [
        d.contactName,
        d.type === "given" ? t.given : t.taken,
        d.amount,
        getRemaining(d),
        d.date,
        d.dueDate || "",
        t[getStatus(d)],
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `hisobot_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>{t.reports}</h2>
        <button style={styles.btnPrimary} onClick={exportCSV}>
          {t.csvExport}
        </button>
      </div>

      <div style={styles.grid2}>
        <div
          style={{
            ...styles.metricCard,
            borderLeft: `6px solid ${colors.primaryColor}`,
          }}
        >
          <div style={styles.label}>{t.monthlyIn || "Oylik Kirim"}</div>
          <div style={{ ...styles.value, color: colors.primaryColor }}>
            +{fmt(monthlyIn)}
          </div>
          <div style={styles.sub}>{t.currencyName}</div>
        </div>
        <div style={{ ...styles.metricCard, borderLeft: `6px solid #c0392b` }}>
          <div style={styles.label}>{t.monthlyOut || "Oylik Chiqim"}</div>
          <div style={{ ...styles.value, color: "#c0392b" }}>
            -{fmt(monthlyOut)}
          </div>
          <div style={styles.sub}>{t.currencyName}</div>
        </div>
      </div>

      <div style={styles.grid4}>
        <div style={styles.metricCard}>
          <div style={styles.label}>{t.contactsCount}</div>
          <div style={styles.value}>{data.contacts.length}</div>
          <div style={styles.sub}>{t.peopleCount}</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.label}>{t.dailyPayment || "Kundalik chiqim"}</div>
          <div style={{ ...styles.value, color: colors.blue }}>
            {fmt(totalDaily)}
          </div>
          <div style={styles.sub}>{t.currencyName}</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.label}>Qarzdorlar soni</div>
          <div style={{ ...styles.value, color: "#c0392b" }}>
            {overdueCount + activeCount}
          </div>
          <div style={styles.sub}>{t.peopleCount}</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.label}>{t.numberPayments || "To'lovlar soni"}</div>
          <div style={{ ...styles.value, color: colors.blue }}>
            {data.payments.length}
          </div>
          <div style={styles.sub}>
            {t.unit}
            {t.payment}
          </div>
        </div>
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>{t.debtStatus}</div>
          <div style={styles.statRow}>
            <span>{t.active}</span>
            <span style={{ color: colors.blue, fontWeight: 600 }}>
              {activeCount} ta
            </span>
          </div>
          <div style={styles.statRow}>
            <span>{t.overdue}</span>
            <span style={{ color: "#c0392b", fontWeight: 600 }}>
              {overdueCount} ta
            </span>
          </div>
          <div style={styles.statRow}>
            <span>{t.closed}</span>
            <span style={{ color: colors.primaryColor, fontWeight: 600 }}>
              {closedCount} ta
            </span>
          </div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>{t.topDebtors}</div>
          {topDebtors.length === 0 ? (
            <p style={styles.empty}>{t.noData}</p>
          ) : (
            topDebtors.map(([name, amt]) => (
              <div key={name} style={styles.statRow}>
                <span>{name}</span>
                <span style={{ fontWeight: 600, color: colors.blue }}>
                  {fmt(amt)} {t.currencyName}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {overdueDebts.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Kechikkan qarzlar</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>{t.colPerson}</th>
                <th style={styles.th}>{t.amount}</th>
                <th style={styles.th}>{t.returnDate}</th>
                <th style={styles.th}>{t.colRemaining}</th>
              </tr>
            </thead>
            <tbody>
              {overdueDebts.map((d) => (
                <tr key={d.id}>
                  <td style={styles.td}>{d.contactName}</td>
                  <td style={styles.td}>
                    {fmt(d.amount)} {d.currency}
                  </td>
                  <td style={{ ...styles.td, color: "#c0392b" }}>
                    {d.dueDate}
                  </td>
                  <td
                    style={{ ...styles.td, fontWeight: 600, color: "#c0392b" }}
                  >
                    {fmt(getRemaining(d))} {d.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.cardTitle}>Oxirgi to'lovlar</div>
        {recentPayments.length === 0 ? (
          <p style={styles.empty}>{t.noPayments}</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>{t.colDate}</th>
                <th style={styles.th}>{t.colPerson}</th>
                <th style={styles.th}>{t.amountPaid}</th>
                <th style={styles.th}>{t.note}</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p) => (
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
                </tr>
              ))}
            </tbody>
          </table>
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
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1rem",
    marginBottom: "1rem",
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
    marginBottom: "1rem",
  },
  metricCard: {
    background: "white",
    borderRadius: "12px",
    padding: "1.25rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    border: "1px solid #eee",
  },
  label: {
    fontSize: "13px",
    color: "#666",
    fontWeight: 500,
    marginBottom: "8px",
  },
  value: { fontSize: "22px", fontWeight: 700 },
  sub: { fontSize: "11px", color: "#999", marginTop: "4px" },
  card: {
    background: "white",
    borderRadius: "12px",
    padding: "1.25rem",
    border: "1px solid #eee",
    marginBottom: "1rem",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: 600,
    marginBottom: "1rem",
    color: "#333",
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #f9f9f9",
    fontSize: "14px",
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
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 500,
  },
  empty: {
    color: "#999",
    fontSize: "13px",
    textAlign: "center",
    padding: "1rem",
  },
};
