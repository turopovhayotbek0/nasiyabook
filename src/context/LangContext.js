import React, { createContext, useContext, useState } from "react";
import { langs } from "../styles/langs";

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem("nasiya_lang") || "uz");

  function changeLang(l) {
    setLang(l);
    localStorage.setItem("nasiya_lang", l);
  }

  const t = langs[lang];

  return (
    <LangContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
