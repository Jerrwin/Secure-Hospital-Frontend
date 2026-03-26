import { configureStore } from "@reduxjs/toolkit";
import sagaMiddleware from "./sagaMiddleware"; // ← import from sagaMiddleware.js
import rootReducer from "./rootReducer"; // ← use rootReducer.js
import rootSaga from "./rootSaga";

const isDevelopment = process.env.NODE_ENV !== "production";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ 
      thunk: false,
      serializableCheck: { warnAfter: 128 },
      immutableCheck: { warnAfter: 128 }
    }).concat(sagaMiddleware),
  devTools: isDevelopment ? {
    maxAge: 50,
    trace: false,
    traceLimit: 10
  } : false, // Hard disabled in production for security
});

sagaMiddleware.run(rootSaga);

export default store;