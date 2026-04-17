// import React, { useState } from "react";
// import { useApp } from "../context/AppContext";
// import { colors } from "../styles/colors";
// import { useLang } from "../context/LangContext";

// export default function Debts() {
//   const { data, addDebt, deleteItem, updateItem } = useApp();
//   const { t } = useLang();
//   const [showForm, setShowForm] = useState(false);
//   const [filter, setFilter] = useState("all");
//   const [editId, setEditId] = useState(null);
//   const [editForm, setEditForm] = useState(null);
//   const [form, setForm] = useState({
//     contactId: "",
//     type: "given",
//     amount: "",
//     currency: "UZS",
//     date: today(),
//     dueDate: "",
//     comment: "",
//     status: "active",
//   });

//   function today() {
//     return new Date().toISOString().split("T")[0];
//   }

//   function fmt(n) {
//     return new Intl.NumberFormat("uz-UZ").format(n);
//   }

//   function handleSave() {
//     if (!form.contactId) return alert(t.selectContactAlert);
//     if (!form.amount) return alert(t.enterAmountAlert);
//     const contact = data.contacts.find((c) => c.id === form.contactId);
//     addDebt({
//       ...form,
//       amount: Number(form.amount),
//       contactName: contact.name,
//     });
//     setForm({
//       contactId: "",
//       type: "given",
//       amount: "",
//       currency: "UZS",
//       date: today(),
//       dueDate: "",
//       comment: "",
//       status: "active",
//     });
//     setShowForm(false);
//   }

//   function handleEdit(debt) {
//     setEditId(debt.id);
//     setEditForm({
//       contactId: debt.contactId || "",
//       type: debt.type,
//       amount: debt.amount,
//       currency: debt.currency,
//       date: debt.date,
//       dueDate: debt.dueDate || "",
//       comment: debt.comment || "",
//       status: debt.status,
//     });
//     setShowForm(false);
//   }

//   function handleEditSave() {
//     if (!editForm.amount) return alert(t.enterAmountAlert);
//     const contact = data.contacts.find((c) => c.id === editForm.contactId);
//     const existingDebt = data.debts.find((d) => d.id === editId);
//     updateItem("debts", editId, {
//       ...editForm,
//       amount: Number(editForm.amount),
//       contactName: contact ? contact.name : existingDebt.contactName,
//     });
//     setEditId(null);
//     setEditForm(null);
//   }

//   function getStatus(debt) {
//     if (debt.status === "closed") return "closed";
//     if (debt.dueDate && debt.dueDate < today()) return "overdue";
//     return "active";
//   }

//   function statusBadge(s) {
//     const map = {
//       active: { label: t.active, bg: "#E6F1FB", color: colors.primaryColor },
//       overdue: { label: t.overdue, bg: "#FCEBEB", color: "#c0392b" },
//       closed: { label: t.closed, bg: colors.iconBg, color: colors.blue },
//     };
//     const st = map[s];
//     return (
//       <span
//         style={{
//           padding: "2px 8px",
//           borderRadius: "12px",
//           fontSize: "11px",
//           fontWeight: 500,
//           background: st.bg,
//           color: st.color,
//         }}
//       >
//         {st.label}
//       </span>
//     );
//   }

//   let debts = data.debts;
//   if (filter === "active")
//     debts = debts.filter((d) => getStatus(d) === "active");
//   else if (filter === "overdue")
//     debts = debts.filter((d) => getStatus(d) === "overdue");
//   else if (filter === "closed")
//     debts = debts.filter((d) => getStatus(d) === "closed");
//   else if (filter === "given") debts = debts.filter((d) => d.type === "given");
//   else if (filter === "taken") debts = debts.filter((d) => d.type === "taken");

//   return (
//     <div className="debtsPluse" style={styles.debtsPluse}>
//       <div style={styles.header}>
//         <h2 style={styles.title}>{t.debts}</h2>
//         <button
//           style={styles.btnPrimary}
//           onClick={() => {
//             setShowForm(true);
//             setEditId(null);
//             setEditForm(null);
//           }}
//         >
//           {t.addDebt}
//         </button>
//       </div>

//       {showForm && (
//         <div style={styles.formCard}>
//           <h3 style={styles.formTitle}>{t.newDebt}</h3>
//           {data.contacts.length === 0 ? (
//             <p style={{ color: "#c0392b" }}>{t.firstAddContact}</p>
//           ) : (
//             <>
//               <div className="form-grid" style={styles.formGrid}>
//                 <div>
//                   <label style={styles.label}>{t.colPerson}*</label>
//                   <select
//                     style={styles.input}
//                     value={form.contactId}
//                     onChange={(e) =>
//                       setForm({ ...form, contactId: e.target.value })
//                     }
//                   >
//                     <option value="">{t.selectContact}</option>
//                     {data.contacts.map((c) => (
//                       <option key={c.id} value={c.id}>
//                         {c.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label style={styles.label}>{t.debtType}</label>
//                   <select
//                     style={styles.input}
//                     value={form.type}
//                     onChange={(e) => setForm({ ...form, type: e.target.value })}
//                   >
//                     <option value="given">{t.menBerdim}</option>
//                     <option value="taken">{t.mengaBerishdi}</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label style={styles.label}>{t.amount}*</label>
//                   <input
//                     style={styles.input}
//                     type="number"
//                     value={form.amount}
//                     onChange={(e) =>
//                       setForm({ ...form, amount: e.target.value })
//                     }
//                   />
//                 </div>
//                 <div>
//                   <label style={styles.label}>{t.currencyVallyuta}</label>
//                   <select
//                     style={styles.input}
//                     value={form.currency}
//                     onChange={(e) =>
//                       setForm({ ...form, currency: e.target.value })
//                     }
//                   >
//                     <option value="UZS">UZS</option>
//                     <option value="USD">USD</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label style={styles.label}>{t.givenDate}</label>
//                   <input
//                     style={styles.input}
//                     type="date"
//                     value={form.date}
//                     onChange={(e) => setForm({ ...form, date: e.target.value })}
//                   />
//                 </div>
//                 <div>
//                   <label style={styles.label}>{t.returnDate}</label>
//                   <input
//                     style={styles.input}
//                     type="date"
//                     value={form.dueDate}
//                     onChange={(e) =>
//                       setForm({ ...form, dueDate: e.target.value })
//                     }
//                   />
//                 </div>
//                 <div style={{ gridColumn: "span 2" }}>
//                   <label style={styles.label}>{t.note}</label>
//                   <input
//                     style={styles.input}
//                     value={form.comment}
//                     onChange={(e) =>
//                       setForm({ ...form, comment: e.target.value })
//                     }
//                   />
//                 </div>
//               </div>
//               <div style={styles.formFooter}>
//                 <button
//                   style={styles.btnSecondary}
//                   onClick={() => setShowForm(false)}
//                 >
//                   {t.cancel}
//                 </button>
//                 <button style={styles.btnPrimary} onClick={handleSave}>
//                   {t.save}
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       )}

//       {editId && editForm && (
//         <div style={styles.formCard}>
//           <h3 style={styles.formTitle}>{t.editDebt || "Qarzni tahrirlash"}</h3>
//           <div className="form-grid" style={styles.formGrid}>
//             <div>
//               <label style={styles.label}>{t.colPerson}</label>
//               <select
//                 style={styles.input}
//                 value={editForm.contactId}
//                 onChange={(e) =>
//                   setEditForm({ ...editForm, contactId: e.target.value })
//                 }
//               >
//                 <option value="">{t.selectContact}</option>
//                 {data.contacts.map((c) => (
//                   <option key={c.id} value={c.id}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label style={styles.label}>{t.debtType}</label>
//               <select
//                 style={styles.input}
//                 value={editForm.type}
//                 onChange={(e) =>
//                   setEditForm({ ...editForm, type: e.target.value })
//                 }
//               >
//                 <option value="given">{t.menBerdim}</option>
//                 <option value="taken">{t.mengaBerishdi}</option>
//               </select>
//             </div>
//             <div>
//               <label style={styles.label}>{t.amount}*</label>
//               <input
//                 style={styles.input}
//                 type="number"
//                 value={editForm.amount}
//                 onChange={(e) =>
//                   setEditForm({ ...editForm, amount: e.target.value })
//                 }
//               />
//             </div>
//             <div>
//               <label style={styles.label}>{t.currencyVallyuta}</label>
//               <select
//                 style={styles.input}
//                 value={editForm.currency}
//                 onChange={(e) =>
//                   setEditForm({ ...editForm, currency: e.target.value })
//                 }
//               >
//                 <option value="UZS">UZS</option>
//                 <option value="USD">USD</option>
//               </select>
//             </div>
//             <div>
//               <label style={styles.label}>{t.givenDate}</label>
//               <input
//                 style={styles.input}
//                 type="date"
//                 value={editForm.date}
//                 onChange={(e) =>
//                   setEditForm({ ...editForm, date: e.target.value })
//                 }
//               />
//             </div>
//             <div>
//               <label style={styles.label}>{t.returnDate}</label>
//               <input
//                 style={styles.input}
//                 type="date"
//                 value={editForm.dueDate}
//                 onChange={(e) =>
//                   setEditForm({ ...editForm, dueDate: e.target.value })
//                 }
//               />
//             </div>
//             <div style={{ gridColumn: "span 2" }}>
//               <label style={styles.label}>{t.note}</label>
//               <input
//                 style={styles.input}
//                 value={editForm.comment}
//                 onChange={(e) =>
//                   setEditForm({ ...editForm, comment: e.target.value })
//                 }
//               />
//             </div>
//           </div>
//           <div style={styles.formFooter}>
//             <button
//               style={styles.btnSecondary}
//               onClick={() => {
//                 setEditId(null);
//                 setEditForm(null);
//               }}
//             >
//               {t.cancel}
//             </button>
//             <button style={styles.btnPrimary} onClick={handleEditSave}>
//               {t.save}
//             </button>
//           </div>
//         </div>
//       )}

//       <div style={styles.filterBar}>
//         {["all", "active", "overdue", "closed", "given", "taken"].map((f) => (
//           <button
//             key={f}
//             onClick={() => setFilter(f)}
//             style={{
//               ...styles.filterBtn,
//               ...(filter === f ? styles.filterActive : {}),
//             }}
//           >
//             {t[f]}
//           </button>
//         ))}
//       </div>

//       <div style={styles.card}>
//         {debts.length === 0 ? (
//           <p style={styles.empty}>{t.noDebts}</p>
//         ) : (
//           <>
//             <div className="desktop-only">
//               <table style={styles.table}>
//                 <thead>
//                   <tr>
//                     <th style={styles.th}>{t.colPerson}</th>
//                     <th style={styles.th}>{t.debtType}</th>
//                     <th style={styles.th}>{t.amount}</th>
//                     <th style={styles.th}>{t.givenDate}</th>
//                     <th style={styles.th}>{t.returnDate}</th>
//                     <th style={styles.th}>Status</th>
//                     <th style={styles.th}>{t.note}</th>
//                     <th style={styles.th}></th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {debts.map((d) => (
//                     <tr key={d.id}>
//                       <td style={styles.td}>{d.contactName}</td>
//                       <td style={styles.td}>
//                         <span
//                           style={{
//                             padding: "2px 8px",
//                             borderRadius: "12px",
//                             fontSize: "11px",
//                             fontWeight: 500,
//                             background:
//                               d.type === "given" ? "#E6F1FB" : "#FAEEDA",
//                             color:
//                               d.type === "given"
//                                 ? colors.primaryColor
//                                 : "#854F0B",
//                           }}
//                         >
//                           {d.type === "given" ? t.given : t.taken}
//                         </span>
//                       </td>
//                       <td style={{ ...styles.td, fontWeight: 500 }}>
//                         {fmt(d.amount)} {d.currency}
//                       </td>
//                       <td style={styles.td}>{d.date}</td>
//                       <td style={styles.td}>{d.dueDate || "—"}</td>
//                       <td style={styles.td}>{statusBadge(getStatus(d))}</td>
//                       <td style={styles.td}>{d.comment || "—"}</td>
//                       <td style={styles.td}>
//                         <div style={{ display: "flex", gap: "6px" }}>
//                           <button
//                             style={styles.btnEdit}
//                             onClick={() => handleEdit(d)}
//                           >
//                             {t.edit}
//                           </button>
//                           {getStatus(d) !== "closed" && (
//                             <button
//                               style={styles.btnClose}
//                               onClick={() =>
//                                 updateItem("debts", d.id, { status: "closed" })
//                               }
//                             >
//                               {t.close}
//                             </button>
//                           )}
//                           <button
//                             style={styles.btnDanger}
//                             onClick={() => deleteItem("debts", d.id)}
//                           >
//                             {t.delete}
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <div className="mobile-only">
//               {debts.map((d) => (
//                 <div
//                   key={d.id}
//                   style={{
//                     borderBottom: "1px solid #f0f0f0",
//                     padding: "12px 0",
//                   }}
//                 >
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       marginBottom: "6px",
//                     }}
//                   >
//                     <span style={{ fontWeight: 500, fontSize: "14px" }}>
//                       {d.contactName}
//                     </span>
//                     <span
//                       style={{ fontWeight: 600, color: colors.primaryColor }}
//                     >
//                       {fmt(d.amount)} {d.currency}
//                     </span>
//                   </div>
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       marginBottom: "6px",
//                     }}
//                   >
//                     {statusBadge(getStatus(d))}
//                     <span style={{ fontSize: "12px", color: colors.textColor }}>
//                       {t.colDueDate} {d.dueDate || "—"}
//                     </span>
//                   </div>
//                   <div
//                     style={{
//                       display: "flex",
//                       gap: "6px",
//                       justifyContent: "flex-end",
//                     }}
//                   >
//                     <button
//                       style={styles.btnEdit}
//                       onClick={() => handleEdit(d)}
//                     >
//                       {t.edit}
//                     </button>
//                     {getStatus(d) !== "closed" && (
//                       <button
//                         style={styles.btnClose}
//                         onClick={() =>
//                           updateItem("debts", d.id, { status: "closed" })
//                         }
//                       >
//                         {t.close}
//                       </button>
//                     )}
//                     <button
//                       style={styles.btnDanger}
//                       onClick={() => deleteItem("debts", d.id)}
//                     >
//                       {t.delete}
//                     </button>
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
//   title: { fontSize: "22px", fontWeight: 600 },
//   card: {
//     background: "white",
//     borderRadius: "10px",
//     padding: "1.25rem",
//     border: `1px solid ${colors.textColor}`,
//   },
//   formCard: { marginBottom: "20px" },
//   formTitle: { fontSize: "16px", fontWeight: 600, marginBottom: "1rem" },
//   formGrid: {
//     flexWrap: "wrap",
//     display: "grid",
//     gridTemplateColumns: "1fr 1fr",
//     gap: "1rem",
//     marginBottom: "1rem",
//   },
//   formFooter: { display: "flex", gap: "8px", justifyContent: "flex-end" },
//   label: {
//     fontSize: "12px",
//     fontWeight: 500,
//     color: colors.textColor,
//     display: "block",
//     marginBottom: "4px",
//   },
//   input: {
//     width: "100%",
//     padding: "8px 10px",
//     fontSize: "13px",
//     border: `1px solid ${colors.textColor}`,
//     borderRadius: "6px",
//     boxSizing: "border-box",
//   },
//   table: { width: "100%", borderCollapse: "collapse" },
//   th: {
//     textAlign: "left",
//     padding: "4px 6px",
//     fontSize: "12px",
//     color: "#888",
//     borderBottom: `1px solid ${colors.textColor}`,
//     fontWeight: 500,
//   },
//   td: {
//     padding: "5px 6px",
//     fontSize: "13px",
//     borderBottom: `1px solid ${colors.textColor}`,
//   },
//   filterBar: {
//     display: "flex",
//     gap: "8px",
//     marginBottom: "1rem",
//     flexWrap: "wrap",
//   },
//   filterBtn: {
//     padding: "5px 14px",
//     fontSize: "12px",
//     border: `1px solid ${colors.textColor}`,
//     borderRadius: "20px",
//     cursor: "pointer",
//     background: "white",
//     color: "black",
//   },
//   filterActive: {
//     background: colors.primaryColor,
//     color: "white",
//   },
//   btnPrimary: {
//     padding: "8px 16px",
//     background: colors.primaryColor,
//     color: "white",
//     border: "none",
//     borderRadius: "6px",
//     cursor: "pointer",
//     fontSize: "13px",
//     fontWeight: 500,
//   },
//   btnSecondary: {
//     padding: "8px 16px",
//     background: "white",
//     color: "black",
//     border: `1px solid ${colors.textColor}`,
//     borderRadius: "6px",
//     cursor: "pointer",
//     fontSize: "13px",
//   },
//   btnEdit: {
//     padding: "4px 10px",
//     background: colors.iconBg,
//     color: colors.blue,
//     border: `1px solid ${colors.blue}`,
//     borderRadius: "6px",
//     cursor: "pointer",
//     fontSize: "12px",
//   },
//   btnDanger: {
//     padding: "4px 10px",
//     background: "#fff0f0",
//     color: "#c0392b",
//     border: "1px solid #fcc",
//     borderRadius: "6px",
//     cursor: "pointer",
//     fontSize: "12px",
//   },
//   btnClose: {
//     padding: "4px 10px",
//     background: colors.primaryBg,
//     color: colors.primaryColor,
//     border: `1px solid ${colors.textColor}`,
//     borderRadius: "6px",
//     cursor: "pointer",
//     fontSize: "12px",
//   },
//   empty: {
//     color: colors.textColor,
//     fontSize: "14px",
//     textAlign: "center",
//     padding: "2rem",
//   },
// };
