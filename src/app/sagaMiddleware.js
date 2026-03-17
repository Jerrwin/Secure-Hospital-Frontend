// ✅ Fix — add this to sagaMiddleware.js
import createSagaMiddleware from "redux-saga";

const sagaMiddleware = createSagaMiddleware();

export default sagaMiddleware;