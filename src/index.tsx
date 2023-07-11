import { createRoot } from "react-dom/client";
import React from "react";
import { App } from "./App";
import { Provider } from "react-redux";
import { setupStore } from "./app/store";

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Provider store={setupStore()}>
        <App />
    </Provider>
  </React.StrictMode>,
);
