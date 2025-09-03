// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import whiteboardRootReducer from "./rootReducer";
import storage from "redux-persist/lib/storage";
import {persistReducer, persistStore} from "redux-persist";
import {PERSIST_STORE_NAME} from "../constants/app.constant";
const middlewares = []

const persistConfig = {
    key: PERSIST_STORE_NAME,
    keyPrefix: '',
    storage,
    whitelist: ['auth', 'locale'],
}
const persistedReducer = persistReducer(persistConfig, whiteboardRootReducer)

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
    }).concat(middlewares),
    devTools: process.env.NODE_ENV === 'development'
});

export const premiumPersistor = persistStore(store)

export default store