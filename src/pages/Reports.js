import React from "react";
import { useApp } from "../context/AppContext";
import { colors } from "../styles/colors";
import { useLang } from "../context/LangContext";

export default function Reports() {
  const { data } = useApp();
  const { t } = useLang();

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
    const today = new Date().toISOString().split("T")[0];
    if (getRemaining(debt) === 0) return "closed";
    if (debt.dueDate && debt.dueDate < today) return "overdue";
    return "active";
  }

  const totalGiven = data.debts
    .filter((d) => d.type === "given")
    .reduce((s, d) => s + Number(d.amount), 0);
  const totalTaken = data.debts
    .filter((d) => d.type === "taken")
    .reduce((s, d) => s + Number(d.amount), 0);
  const totalPaid = data.payments.reduce((s, p) => s + Number(p.amount), 0);

  const active = data.debts.filter((d) => getStatus(d) === "active").length;
  const overdue = data.debts.filter((d) => getStatus(d) === "overdue").length;
  const closed = data.debts.filter((d) => getStatus(d) === "closed").length;

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

  // CSV Eksport funksiyasini tarjimaga moslashtiramiz
  function exportCSV() {
    const rows = [
      [
        t.colName,
        t.colType,
        t.colAmount,
        t.colRemaining,
        t.colDate,
        t.colDueDate,
        t.colStatus,
      ],
      ...data.debts.map((d) => [
        d.contactName,
        d.type === "given" ? t.given : t.taken,
        d.amount,
        getRemaining(d),
        d.date,
        d.dueDate || "",
        t[getStatus(d)], // getStatus "active", "closed" va hk qaytaradi
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `nasiyabook_report_${new Date().toISOString().slice(0, 10)}.csv`;
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

      <div style={styles.grid4}>
        <div style={styles.metricCard}>
          <div style={styles.label}>{t.totalGiven}</div>
          <div style={{ ...styles.value, color: colors.blue }}>
            {fmt(totalGiven)}
          </div>
          <div style={styles.sub}>{t.currencyName}</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.label}>{t.totalTaken}</div>
          <div style={{ ...styles.value, color: colors.redhead }}>
            {fmt(totalTaken)}
          </div>
          <div style={styles.sub}>{t.currencyName}</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.label}>{t.totalPaid}</div>
          <div style={{ ...styles.value, color: colors.primaryColor }}>
            {fmt(totalPaid)}
          </div>
          <div style={styles.sub}>{t.currencyName}</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.label}>{t.contactsCount}</div>
          <div style={styles.value}>{data.contacts.length}</div>
          <div style={styles.sub}>{t.peopleCount}</div>
        </div>
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>{t.debtStatus}</div>
          <div style={styles.statRow}>
            <span>{t.active}</span>
            <span style={{ color: colors.blue, fontWeight: 600 }}>
              {active} {t.itemsCount}
            </span>
          </div>
          <div style={styles.statRow}>
            <span>{t.overdue}</span>
            <span style={{ color: colors.red, fontWeight: 600 }}>
              {overdue} {t.itemsCount}
            </span>
          </div>
          <div style={styles.statRow}>
            <span>{t.closed}</span>
            <span style={{ color: colors.primaryColor, fontWeight: 600 }}>
              {closed} {t.itemsCount}
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
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  metricCard: {
    background: "white",
    borderRadius: "10px",
    padding: "1.25rem",
    border: `1px solid ${colors.textColor}`,
  },
  label: { fontSize: "12px", color: colors.textColor, marginBottom: "8px" },
  value: { fontSize: "24px", fontWeight: 600 },
  sub: { fontSize: "11px", color: colors.textColor, marginTop: "4px" },
  card: {
    background: "white",
    borderRadius: "10px",
    padding: "1.25rem",
    border: `1px solid ${colors.textColor}`,
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "1rem",
    paddingBottom: ".75rem",
    borderBottom: `1px solid ${colors.textColor}`,
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: `1px solid ${colors.textColor}`,
    fontSize: "13px",
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
  empty: {
    color: colors.textColor,
    fontSize: "13px",
    textAlign: "center",
    padding: "1rem",
  },
};
