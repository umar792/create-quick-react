"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduxPersister = exports.reduxStore = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const redux_persist_1 = require("redux-persist");
const storage_1 = __importDefault(require("redux-persist/lib/storage"));
const counterSlice_1 = __importDefault(require("./slices/counterSlice"));
const counterPersistConfig = {
    key: "counter",
    storage: storage_1.default,
};
const persistedCounterReducer = (0, redux_persist_1.persistReducer)(counterPersistConfig, counterSlice_1.default);
exports.reduxStore = (0, toolkit_1.configureStore)({
    reducer: {
        counter: persistedCounterReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
});
exports.reduxPersister = (0, redux_persist_1.persistStore)(exports.reduxStore);
