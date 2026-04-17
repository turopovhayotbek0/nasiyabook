// import React from "react";
// import { useApp } from "../context/AppContext";
// import { colors } from "../styles/colors";
// import { useLang } from "../context/LangContext";

// export default function Dashboard() {
//   const { data } = useApp();
//   const { t, lang } = useLang();

//   function today() {
//     return new Date().toISOString().split("T")[0];
//   }

//   function fmt(n) {
//     const locale = lang === "uz" ? "uz-UZ" : lang === "ru" ? "ru-RU" : "en-US";
//     return new Intl.NumberFormat(locale).format(n);
//   }

//   function getDebtRemaining(debt) {
//     const paid = data.payments
//       .filter((p) => p.debtId === debt.id)
//       .reduce((sum, p) => sum + Number(p.amount), 0);
//     return Math.max(0, Number(debt.amount) - paid);
//   }

//   function getStatus(debt) {
//     if (getDebtRemaining(debt) === 0) return "closed";
//     if (debt.dueDate && debt.dueDate < today()) return "overdue";
//     return "active";
//   }

//   const overdueDebts = data.debts.filter((d) => getStatus(d) === "overdue");
//   const todayDebts = data.debts.filter(
//     (d) => d.dueDate === today() && getStatus(d) !== "closed",
//   );
//   const pendingTasks = data.tasks.filter((t) => t.status === "pending");

//   const totalGiven = data.debts
//     .filter((d) => d.type === "given" && getStatus(d) !== "closed")
//     .reduce((sum, d) => sum + getDebtRemaining(d), 0);

//   const recentDebts = [...data.debts]
//     .sort((a, b) => b.date?.localeCompare(a.date))
//     .slice(0, 5);

//   return (
//     <div>
//       <div style={styles.header}>
//         <h2 style={styles.title}>{t.dashboard}</h2>
//         <div style={styles.date}>
//           {new Date().toLocaleDateString(
//             lang === "uz" ? "uz-UZ" : lang === "ru" ? "ru-RU" : "en-US",
//             {
//               weekday: "long",
//               year: "numeric",
//               month: "long",
//               day: "numeric",
//             },
//           )}
//         </div>
//       </div>

//       <div style={styles.grid4}>
//         <div style={styles.metricCard}>
//           <div style={styles.metricLabel}>{t.givenDebt || "Berilgan qarz"}</div>
//           <div
//             style={{
//               ...styles.metricValue,
//               color: colors.blue,
//               background: colors.iconBg,
//             }}
//           >
//             {fmt(totalGiven)}
//           </div>
//           <div style={styles.metricSub}>{t.currency || "so'm"}</div>
//         </div>
//         <div style={styles.metricCard}>
//           <div style={styles.metricLabel}>{t.takeDebt || "Olish kerak"}</div>
//           <div
//             style={{
//               ...styles.metricValue,
//               color: colors.primaryColor,
//               background: colors.primaryBg,
//             }}
//           >
//             {fmt(totalGiven)}
//           </div>
//           <div style={styles.metricSub}>{t.currency || "so'm"}</div>
//         </div>
//         <div style={styles.metricCard}>
//           <div style={styles.metricLabel}>
//             {t.overdueDebtsTitle || "Kechikkan qarzlar"}
//           </div>
//           <div
//             style={{
//               ...styles.metricValue,
//               color: colors.red,
//               background: "#FCEBEB",
//             }}
//           >
//             {overdueDebts.length}
//           </div>
//           <div style={styles.metricSub}>{t.unit || "ta"}</div>
//         </div>
//         <div style={styles.metricCard}>
//           <div style={styles.metricLabel}>
//             {t.pendingTasks || "Bajarilmagan vazifalar"}
//           </div>
//           <div style={{ ...styles.metricValue, background: colors.iconBg }}>
//             {pendingTasks.length}
//           </div>
//           <div style={styles.metricSub}>{t.unit || "ta"}</div>
//         </div>
//       </div>

//       <div style={styles.grid2}>
//         <div style={styles.card}>
//           <div style={styles.cardHeader}>
//             <div style={styles.cardTitle}>
//               {t.todayPayments || "Bugungi to'lovlar"}
//             </div>
//             <span style={styles.badge}>
//               {todayDebts.length} {t.unit || "ta"}
//             </span>
//           </div>
//           {todayDebts.length === 0 ? (
//             <p style={styles.empty}>{t.noPaymentsToday}</p>
//           ) : (
//             todayDebts.map((d) => (
//               <div key={d.id} style={styles.row}>
//                 <span>{d.contactName}</span>
//                 <span style={{ fontWeight: 500, color: colors.primaryColor }}>
//                   {fmt(getDebtRemaining(d))} {t.currency || "so'm"}
//                 </span>
//               </div>
//             ))
//           )}
//         </div>

//         <div style={styles.card}>
//           <div style={styles.cardHeader}>
//             <div style={styles.cardTitle}>
//               {" "}
//               {t.overdueDebtsTitle || "Kechikkan qarzlar"}
//             </div>
//             <span
//               style={{
//                 ...styles.badge,
//                 background: "#FCEBEB",
//                 color: "#c0392b",
//               }}
//             >
//               {overdueDebts.length} {t.unit || "ta"}
//             </span>
//           </div>
//           {overdueDebts.length === 0 ? (
//             <p style={styles.empty}>{t.noOverdueDebts}</p>
//           ) : (
//             overdueDebts.map((d) => (
//               <div key={d.id} style={styles.row}>
//                 <span>{d.contactName}</span>
//                 <span style={{ fontWeight: 500, color: "#c0392b" }}>
//                   {fmt(getDebtRemaining(d))} {t.currency || "so'm"}
//                 </span>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       <div style={styles.card}>
//         <div style={styles.cardHeader}>
//           <div style={styles.cardTitle}>{t.recentDebts}</div>
//         </div>
//         {recentDebts.length === 0 ? (
//           <p style={styles.empty}>{t.noData}</p>
//         ) : (
//           <>
//             <div className="desktop-only">
//               <table style={styles.table}>
//                 <thead>
//                   <tr>
//                     <th style={styles.th}>{t.colPerson}</th>
//                     <th style={styles.th}>{t.colAmount}</th>
//                     <th style={styles.th}>{t.colDate}</th>
//                     <th style={styles.th}>{t.colDueDate}</th>
//                     <th style={styles.th}>{t.colRemaining}</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {recentDebts.map((d) => (
//                     <tr key={d.id}>
//                       <td style={styles.td}>{d.contactName}</td>
//                       <td style={styles.td}>
//                         {fmt(d.amount)} {t.currency || "so'm"}
//                       </td>
//                       <td style={styles.td}>{d.date}</td>
//                       <td style={styles.td}>{d.dueDate || "—"}</td>
//                       <td
//                         style={{
//                           ...styles.td,
//                           fontWeight: 500,
//                           color:
//                             getDebtRemaining(d) === 0
//                               ? colors.primaryColor
//                               : colors.primaryColor,
//                         }}
//                       >
//                         {fmt(getDebtRemaining(d))} {t.currency || "so'm"}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <div className="mobile-only">
//               {recentDebts.map((d) => (
//                 <div
//                   key={d.id}
//                   style={{
//                     borderBottom: "1px solid #f0f0f0",
//                     padding: "10px 0",
//                   }}
//                 >
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       marginBottom: "4px",
//                     }}
//                   >
//                     <span style={{ fontWeight: 500, fontSize: "14px" }}>
//                       {d.contactName}
//                     </span>
//                     <span
//                       style={{ fontWeight: 500, color: colors.primaryColor }}
//                     >
//                       {fmt(d.amount)} so'm
//                     </span>
//                   </div>
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       fontSize: "12px",
//                       color: "#888",
//                     }}
//                   >
//                     <span>Sana: {d.date}</span>
//                     <span>Qoldiq: {fmt(getDebtRemaining(d))} so'm</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// const styles = {
//   header: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "1.5rem",
//   },
//   title: { fontSize: "22px", fontWeight: 600, color: "black" },
//   date: { fontSize: "13px", color: "#888" },
//   grid4: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
//     gap: "1rem",
//     marginBottom: "1.5rem",
//   },
//   grid2: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1fr",
//     gap: "1rem",
//     marginBottom: "1rem",
//   },
//   metricCard: {
//     background: "white",
//     borderRadius: "10px",
//     padding: "1.25rem",
//     border: `1px solid ${colors.textColor}`,
//   },
//   metricLabel: { fontSize: "16px", color: "black", marginBottom: "12px" },
//   metricValue: {
//     fontSize: "20px",
//     fontWeight: 600,
//     color: colors.textColor,
//     display: "inline",
//     padding: "4px 14px",
//     borderRadius: "10px",
//   },
//   metricSub: { fontSize: "12px", color: "black", marginTop: "8px" },
//   card: {
//     background: "white",
//     borderRadius: "10px",
//     padding: "1.25rem",
//     border: `1px solid ${colors.textColor}`,
//     marginBottom: "1rem",
//   },
//   cardHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "1rem",
//     paddingBottom: ".75rem",
//     borderBottom: `1px solid ${colors.textColor}`,
//   },
//   cardTitle: { fontSize: "16px", fontWeight: 600 },
//   badge: {
//     padding: "2px 8px",
//     borderRadius: "12px",
//     fontSize: "12px",
//     fontWeight: 500,
//     background: colors.primaryBg,
//     color: colors.primaryColor,
//   },
//   row: {
//     display: "flex",
//     justifyContent: "space-between",
//     padding: "8px 0",
//     borderBottom: `1px solid ${colors.textColor}`,
//     fontSize: "13px",
//   },
//   table: { width: "100%", borderCollapse: "collapse" },
//   th: {
//     textAlign: "left",
//     padding: "8px 12px",
//     fontSize: "12px",
//     color: colors.textColor,
//     borderBottom: `1px solid ${colors.textColor}`,
//     fontWeight: 500,
//   },
//   td: {
//     padding: "10px 12px",
//     fontSize: "13px",
//     borderBottom: `1px solid ${colors.textColor}`,
//   },
//   empty: {
//     color: colors.textColor,
//     fontSize: "13px",
//     textAlign: "center",
//     padding: "1.5rem 0",
//   },
// };
