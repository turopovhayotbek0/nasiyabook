import React from "react";
import ReactDOM from "react-dom/client";
import { AppProvider } from "./context/AppContext";
import { LangProvider } from "./context/LangContext";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <LangProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </LangProvider>
  </React.StrictMode>,
);
