import { createSlice } from "@reduxjs/toolkit";

const getStoredUser = () => {
  try {
    const user = localStorage.getItem("user");
    if (!user || user === "undefined") return null;
    return JSON.parse(user);
  } catch (e) {
    return null;
  }
};

const initialState = {
  user: getStoredUser(),
  accessToken: null, 
  csrfToken: null,
  status: getStoredUser() ? "loading" : "idle", 
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ─── Triggered by component ──────────────────────────────────
    loginRequest: (state) => {
      state.status = "loading";
      state.error = null;
    },

    // ─── Triggered by saga on success ────────────────────────────
    loginSuccess: (state, action) => {
      state.status = "succeeded";
      state.user = action.payload.user;
      state.accessToken = action.payload.access_token;
      state.csrfToken = action.payload.csrf_token;
      state.error = null;
    },

    // ─── Triggered by saga on failure ────────────────────────────
    loginFailure: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
      state.user = null;
      state.accessToken = null;
      state.csrfToken = null;
      localStorage.removeItem("user");
    },

    // ─── Logout ──────────────────────────────────────────────────
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.csrfToken = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("user");
    },

    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
  },
});

export const { loginRequest, loginSuccess, loginFailure, logout, clearError, updateUser } =
  authSlice.actions;

export default authSlice.reducer;
