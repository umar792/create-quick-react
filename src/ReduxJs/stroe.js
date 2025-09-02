import storage from 'redux-persist/lib/storage';
import { configureStore } from '@reduxjs/toolkit';
import { counterReducer } from './slices/CounterSlice';
import { persistStore, persistReducer } from "redux-persist";


const counterPersistConfig = {
    key: "counter",
    storage
};

const CounterPersistReducer = persistReducer(counterPersistConfig , counterReducer);


export const reduxStore = configureStore({
    reducer : {
        counter : CounterPersistReducer,
    }
});

export const reduxPersister = persistStore(reduxStore);