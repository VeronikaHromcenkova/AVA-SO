import React from "react";
import ReactDOM from "react-dom/client";
import { initializeIcons, ThemeProvider } from "@fluentui/react";

import RenderRoutes from "./routes/RenderRoutes";
import { AppStateProvider } from "./state/AppProvider";
import mainTheme from "./utils/mainTheme";

import "./index.css";

initializeIcons();

export default function App() {
  return (
    <AppStateProvider>
      <ThemeProvider theme={mainTheme} className="themeContainer">
        <RenderRoutes />
      </ThemeProvider>
    </AppStateProvider>
  );
}

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
