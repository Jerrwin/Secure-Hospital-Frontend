import { call, put, takeLatest } from "redux-saga/effects";
import { loginAPI } from "./authAPI";
import { loginRequest, loginSuccess, loginFailure } from "./authSlice";

function* loginSaga(action) {
  try {
    // action.payload = { email, password }
    const response = yield call(loginAPI, action.payload);

    if (response.success) {
      const { access_token, csrf_token, user } = response.data;

      // Persist tokens to localStorage
      // axiosClient interceptor reads from here automatically
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("csrf_token", csrf_token);
      localStorage.setItem("user", JSON.stringify(user));

      yield put(loginSuccess({ access_token, csrf_token, user }));
    } else {
      yield put(loginFailure(response.message || "Login failed."));
    }
  } catch (error) {
    // Handle backend error messages gracefully
    const message =
      error.response?.data?.message ||
      "Unable to connect. Please try again.";
    yield put(loginFailure(message));
  }
}

export default function* authSaga() {
  // takeLatest — prevents duplicate login if button clicked twice
  yield takeLatest(loginRequest.type, loginSaga);
}