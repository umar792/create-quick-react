import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import counterReducer from "./slices/counterSlice";

const counterPersistConfig = {
  key: "counter",
  storage,
};

const persistedCounterReducer = persistReducer(counterPersistConfig, counterReducer);

export const reduxStore = configureStore({
  reducer: {
    counter: persistedCounterReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export const reduxPersister = persistStore(reduxStore);

export type RootState = ReturnType<typeof reduxStore.getState>;
export type AppDispatch = typeof reduxStore.dispatch;
