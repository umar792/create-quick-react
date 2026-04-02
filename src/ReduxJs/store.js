import storage from "redux-persist/lib/storage";
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import counterReducer from "./slices/counterSlice";

const counterPersistConfig = {
  key: "counter",
  storage,
};

const counterPersistReducer = persistReducer(counterPersistConfig, counterReducer);

export const reduxStore = configureStore({
  reducer: {
    counter: counterPersistReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export const reduxPersister = persistStore(reduxStore);
