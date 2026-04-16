import React from "react";
import { useApp } from "../context/AppContext";
import { colors } from "../styles/colors";
import { useLang } from "../context/LangContext";

export default function Reports() {
  const { data, monthlyIn, monthlyOut } = useApp();
  const { t } = useLang();

  // Raqamlarni o'zbek formatida chiqarish (1 000 000)
  const fmt = (n) => new Intl.NumberFormat("uz-UZ").format(n);

  // Qolgan qarzni hisoblash
  const getRemaining = (debt) => {
    const paid = data.payments
      .filter((p) => p.debtId === debt.id)
      .reduce((s, p) => s + Number(p.amount), 0);
    return Math.max(0, Number(debt.amount) - paid);
  };

  // Qarz statusini aniqlash
  const getStatus = (debt) => {
    const today = new Date().toISOString().split("T")[0];
    if (getRemaining(debt) === 0) return "closed";
    if (debt.dueDate && debt.dueDate < today) return "overdue";
    return "active";
  };

  // Umumiy hisob-kitoblar
  const totalGiven = data.debts
    .filter((d) => d.type === "given")
    .reduce((s, d) => s + Number(d.amount), 0);
  const totalTaken = data.debts
    .filter((d) => d.type === "taken")
    .reduce((s, d) => s + Number(d.amount), 0);
  const totalPaid = data.payments.reduce((s, p) => s + Number(p.amount), 0);

  // Status bo'yicha sonlar
  const activeCount = data.debts.filter(
    (d) => getStatus(d) === "active",
  ).length;
  const overdueCount = data.debts.filter(
    (d) => getStatus(d) === "overdue",
  ).length;
  const closedCount = data.debts.filter(
    (d) => getStatus(d) === "closed",
  ).length;

  // Eng ko'p qarzdorlar (Top 5)
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

  // CSV Eksport funksiyasi
  const exportCSV = () => {
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
        t[getStatus(d)],
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hisobot_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div style={styles.container}>
      {/* Sarlavha qismi */}
      <div style={styles.header}>
        <h2 style={styles.title}>{t.reports}</h2>
        <button style={styles.btnPrimary} onClick={exportCSV}>
          {t.csvExport}
        </button>
      </div>

      {/* 1-QATOR: Oylik Kirim va Chiqim (Emoji olib tashlandi) */}
      <div style={styles.monthlyGrid}>
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
          <div style={styles.sub}>{t.currencyName} (Joriy oy)</div>
        </div>
        <div
          style={{
            ...styles.metricCard,
            borderLeft: `6px solid ${colors.redhead}`,
          }}
        >
          <div style={styles.label}>{t.monthlyOut || "Oylik Chiqim"}</div>
          <div style={{ ...styles.value, color: colors.redhead }}>
            -{fmt(monthlyOut)}
          </div>
          <div style={styles.sub}>{t.currencyName} (Joriy oy)</div>
        </div>
      </div>

      {/* 2-QATOR: Umumiy statistika */}
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

      {/* 3-QATOR: Qarz holati va Eng ko'p qarzdorlar */}
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
            <span style={{ color: colors.redhead, fontWeight: 600 }}>
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
    </div>
  );
}

const styles = {
  container: { paddingBottom: "20px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  title: { fontSize: "22px", fontWeight: 600 },
  monthlyGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1rem",
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1rem",
  },
  metricCard: {
    background: "white",
    borderRadius: "12px",
    padding: "1.25rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    border: "1px solid #eee",
  },
  label: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "500",
    marginBottom: "8px",
  },
  value: { fontSize: "22px", fontWeight: 700 },
  sub: { fontSize: "11px", color: "#999", marginTop: "4px" },
  card: {
    background: "white",
    borderRadius: "12px",
    padding: "1.25rem",
    border: "1px solid #eee",
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
