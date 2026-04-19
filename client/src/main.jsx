import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { AppProviders } from "./app/providers";
import { AppRouter } from "./app/router";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  </React.StrictMode>
);
