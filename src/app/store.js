import { configureStore } from "@reduxjs/toolkit";
import sagaMiddleware from "./sagaMiddleware"; // ← import from sagaMiddleware.js
import rootReducer from "./rootReducer"; // ← use rootReducer.js
import rootSaga from "./rootSaga";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ 
      thunk: false,
      serializableCheck: { warnAfter: 128 },
      immutableCheck: { warnAfter: 128 }
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== "production" ? {
    maxAge: 50, // Limits the payload history size in DevTools
    trace: false, // Disables trace to save memory
    traceLimit: 10
  } : false,
});

sagaMiddleware.run(rootSaga);

export default store;
