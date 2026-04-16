import React, { createContext, useContext, useState, useMemo } from "react";

const AppContext = createContext();

const initialData = {
  contacts: [],
  debts: [],
  tasks: [],
  payments: [],
};

export function AppProvider({ children }) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("nasiyabook");
    return saved ? JSON.parse(saved) : initialData;
  });

  function save(newData) {
    setData(newData);
    localStorage.setItem("nasiyabook", JSON.stringify(newData));
  }

  // --- Oylik Hisob-kitob Mantiqi ---
  const { monthlyIn, monthlyOut } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const mIn = data.payments
      .filter((p) => {
        const pDate = new Date(p.date);
        const debt = data.debts.find((d) => d.id === p.debtId);
        return (
          pDate.getMonth() === currentMonth &&
          pDate.getFullYear() === currentYear &&
          debt?.type === "given"
        );
      })
      .reduce((s, p) => s + Number(p.amount), 0);

    const mOut = data.payments
      .filter((p) => {
        const pDate = new Date(p.date);
        const debt = data.debts.find((d) => d.id === p.debtId);
        return (
          pDate.getMonth() === currentMonth &&
          pDate.getFullYear() === currentYear &&
          debt?.type === "taken"
        );
      })
      .reduce((s, p) => s + Number(p.amount), 0);

    return { monthlyIn: mIn, monthlyOut: mOut };
  }, [data]);

  function addContact(contact) {
    const newContact = { ...contact, id: Date.now().toString() };
    save({ ...data, contacts: [...data.contacts, newContact] });
  }

  function addDebt(debt) {
    const newDebt = { ...debt, id: Date.now().toString() };
    save({ ...data, debts: [...data.debts, newDebt] });
  }

  function addTask(task) {
    const newTask = { ...task, id: Date.now().toString() };
    save({ ...data, tasks: [...data.tasks, newTask] });
  }

  function addPayment(payment) {
    const newPayment = { ...payment, id: Date.now().toString() };
    const newPayments = [...data.payments, newPayment];

    const totalPaid = newPayments
      .filter((p) => p.debtId === payment.debtId)
      .reduce((sum, p) => sum + Number(p.amount), 0);

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
