import React, { createContext, useContext, useState, useMemo } from "react";

const AppContext = createContext();
const initialData = { contacts: [], debts: [], tasks: [], payments: [] };

export function AppProvider({ children }) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("nasiyabook");
    return saved ? JSON.parse(saved) : initialData;
  });

  function save(newData) {
    setData(newData);
    localStorage.setItem("nasiyabook", JSON.stringify(newData));
  }

  const { monthlyIn, monthlyOut } = useMemo(() => {
    const now = new Date();
    const cm = now.getMonth(),
      cy = now.getFullYear();
    const mIn = data.payments
      .filter((p) => {
        const d = new Date(p.date);
        const debt = data.debts.find((x) => x.id === p.debtId);
        return (
          d.getMonth() === cm &&
          d.getFullYear() === cy &&
          debt?.type === "given"
        );
      })
      .reduce((s, p) => s + Number(p.amount), 0);
    const mOut = data.payments
      .filter((p) => {
        const d = new Date(p.date);
        const isCurrentMonth = d.getMonth() === cm && d.getFullYear() === cy;
        const debt = data.debts.find((x) => x.id === p.debtId);
        return (
          isCurrentMonth &&
          (debt?.type === "taken" || p.type === "daily_payment")
        );
      })
      .reduce((s, p) => s + Number(p.amount), 0);
    return { monthlyIn: mIn, monthlyOut: mOut };
  }, [data]);

  function addContact(contact) {
    save({
      ...data,
      contacts: [...data.contacts, { ...contact, id: Date.now().toString() }],
    });
  }
  function addDebt(debt) {
    save({
      ...data,
      debts: [...data.debts, { ...debt, id: Date.now().toString() }],
    });
  }
  function addTask(task) {
    save({
      ...data,
      tasks: [...data.tasks, { ...task, id: Date.now().toString() }],
    });
  }

  function addPayment(payment) {
    const newPayment = { ...payment, id: Date.now().toString() };
    const newPayments = [...data.payments, newPayment];
    const totalPaid = newPayments
      .filter((p) => p.debtId === payment.debtId)
      .reduce((s, p) => s + Number(p.amount), 0);
    const debt = data.debts.find((d) => d.id === payment.debtId);
    let newDebts = data.debts;
    if (debt && totalPaid >= Number(debt.amount)) {
      newDebts = data.debts.map((d) =>
        d.id === payment.debtId ? { ...d, status: "closed" } : d,
      );
    }
    save({ ...data, debts: newDebts, payments: newPayments });
  }

  function deleteItem(type, id) {
    save({ ...data, [type]: data[type].filter((item) => item.id !== id) });
  }
  function updateItem(type, id, updated) {
    save({
      ...data,
      [type]: data[type].map((item) =>
        item.id === id ? { ...item, ...updated } : item,
      ),
    });
  }

  return (
    <AppContext.Provider
      value={{
        data,
        monthlyIn,
        monthlyOut,
        addContact,
        addDebt,
        addTask,
        addPayment,
        deleteItem,
        updateItem,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
