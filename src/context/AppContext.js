import React, { createContext, useContext, useState } from "react";

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
