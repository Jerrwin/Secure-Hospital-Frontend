import { configureStore } from "@reduxjs/toolkit";
import sagaMiddleware from "./sagaMiddleware"; // ← import from sagaMiddleware.js
import rootReducer from "./rootReducer"; // ← use rootReducer.js
import rootSaga from "./rootSaga";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export default store;
