"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduxPersister = exports.reduxStore = void 0;
const storage_1 = __importDefault(require("redux-persist/lib/storage"));
const toolkit_1 = require("@reduxjs/toolkit");
const CounterSlice_1 = require("./slices/CounterSlice");
const redux_persist_1 = require("redux-persist");
const counterPersistConfig = {
    key: "counter",
    storage: storage_1.default
};
const CounterPersistReducer = (0, redux_persist_1.persistReducer)(counterPersistConfig, CounterSlice_1.counterReducer);
exports.reduxStore = (0, toolkit_1.configureStore)({
    reducer: {
        counter: CounterPersistReducer,
    }
});
exports.reduxPersister = (0, redux_persist_1.persistStore)(exports.reduxStore);
