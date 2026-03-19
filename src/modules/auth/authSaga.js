import { call, put, takeLatest } from "redux-saga/effects";
import { loginAPI } from "./authAPI";
import axiosClient from "../../services/axiosClient";
import { loginRequest, loginSuccess, loginFailure } from "./authSlice";

function* loginSaga(action) {
  try {
    // action.payload = { email, password }
    const response = yield call(loginAPI, action.payload);

    if (response.success) {
      // ResponseHelper wraps data in: { success, message, data: { ... tokens ... } }
      // Since loginAPI already returns response.data, 'response' here IS the body.
      const { access_token, csrf_token, user } = response.data;

      localStorage.setItem("user", JSON.stringify(user));
      yield put(loginSuccess({ access_token, csrf_token, user }));
    } else {
      yield put(loginFailure(response.data.message || "Login failed."));
    }
  } catch (error) {
    const message = error.response?.data?.message || "Unable to connect.";
    yield put(loginFailure(message));
  }
}

// Plain function (not a saga) — called once on App mount.
export function checkAuth(dispatch) {
  axiosClient
    .post("/api/auth/refresh")
    .then(({ data }) => {
      if (data.success) {
        // The refresh endpoint might only return tokens, not the full user object.
        // We preserve the existing user profile from localStorage if needed.
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        const { access_token, csrf_token, user } = data.data;
        const activeUser = user || storedUser;

        if (activeUser) {
          localStorage.setItem("user", JSON.stringify(activeUser));
          dispatch(loginSuccess({ access_token, csrf_token, user: activeUser }));
        } else {
          dispatch(loginFailure(null));
        }
      } else {
        dispatch(loginFailure(null));
      }
    })
    .catch(() => {
      // No session cookie - reset status to allow redirect to login
      dispatch(loginFailure(null));
      console.log("No active session found on mount.");
    });
}

export default function* authSaga() {
  // takeLatest — prevents duplicate login if button clicked twice
  yield takeLatest(loginRequest.type, loginSaga);
}
