import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

import { OrderProvider } from "@/components/order/OrderProvider";

import { App } from "./App";
import { ToastProvider } from "./components/ui/ToastProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <OrderProvider>
          <App />
        </OrderProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
