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
      serializableCheck: { warnAfter: 500 },
      immutableCheck: { warnAfter: 500 }
    }).concat(sagaMiddleware),
  devTools: isDevelopment ? {
    maxAge: 50,
    trace: false,
    traceLimit: 10,
    // Sanitize state for DevTools to prevent "state too large" warnings
    stateSanitizer: (state) => {
      // General recursive sanitizer that masks any array > 10
      const sanitizeObject = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) {
          return obj.length > 10 ? `<<ARRAY(${obj.length})>>` : obj.map(sanitizeObject);
        }
        const newObj = {};
        for (const key in obj) {
          newObj[key] = sanitizeObject(obj[key]);
        }
        return newObj;
      };
      
      return sanitizeObject(state);
    },
    actionSanitizer: (action) => {
      if (!action || !action.payload) return action;
      
      // Sanitize payload data if it's a large array
      const sanitizePayload = (payload) => {
        if (!payload || typeof payload !== 'object') return payload;
        if (Array.isArray(payload)) {
          return payload.length > 10 ? `<<LARGE_ARRAY(${payload.length})>>` : payload;
        }
        const newPayload = { ...payload };
        // Check standard "data" or "list" keys in payloads
        ['data', 'list', 'patients', 'staff', 'appointments', 'prescriptions'].forEach(k => {
          if (Array.isArray(newPayload[k]) && newPayload[k].length > 10) {
            newPayload[k] = `<<LARGE_PAYLOAD_ARRAY(${newPayload[k].length})>>`;
          }
        });
        return newPayload;
      };

      return { ...action, payload: sanitizePayload(action.payload) };
    }
  } : false, // Hard disabled in production for security
});

sagaMiddleware.run(rootSaga);

export default store;