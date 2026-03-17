import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  accessToken: localStorage.getItem("access_token") || null,
  csrfToken: localStorage.getItem("csrf_token") || null,
  status: "idle", // idle | loading | succeeded | failed
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
    },

    // ─── Logout ──────────────────────────────────────────────────
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.csrfToken = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("access_token");
      localStorage.removeItem("csrf_token");
      localStorage.removeItem("user");
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;