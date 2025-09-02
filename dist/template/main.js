"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainJS = void 0;
exports.mainJS = `
  import "./index.css";
import App from "./App.jsx";
import { StrictMode } from "react";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
import { reduxStore ,reduxPersister } from "../redux/store";
import { PersistGate  } from "redux-persist/integration/react";


createRoot(document.getElementById("root")).render(
  <Provider store={reduxStore}>
  <PersistGate loading={null} persistor={reduxPersister}>
    <StrictMode>
      <App />
    </StrictMode>
  </Provider>
);

`;
