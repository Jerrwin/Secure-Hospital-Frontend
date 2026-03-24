import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stats: null,
  appointments: [],
  patients: [],
  prescriptions: [],
  staff: [],
  weekly_trend: [],
  loading: false,
  fetched: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    fetchDashboardDataRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDashboardDataSuccess: (state, action) => {
      state.loading = false;
      state.fetched = true;
      const { stats, appointments, patients, prescriptions, staff, weekly_trend } = action.payload;
      if (stats) state.stats = stats;
      if (appointments) state.appointments = appointments;
      if (patients) state.patients = patients;
      if (prescriptions) state.prescriptions = prescriptions;
      if (staff) state.staff = staff;
      if (weekly_trend) state.weekly_trend = weekly_trend;
    },
    fetchDashboardDataFailure: (state, action) => {
      state.loading = false;
      state.fetched = false;
      state.error = action.payload;
    },
    clearDashboardData: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // GLOBAL SIGNAL: If ANY other module (Appointments, Patients, etc.) 
    // successfully updates data, we mark the dashboard as "stale" (fetched: false).
    // This forces a re-fetch the next time the user views the dashboard.
    builder.addMatcher(
      (action) => {
        const type = action.type;
        // ONLY invalidate the dashboard if a real DATA CHANGE occurred in another module.
        // We exclude "fetch" and "login" success actions to prevent infinite loading loops.
        return (
          (type.includes("Success") || type.endsWith("/success")) &&
          !type.startsWith("dashboard/") &&
          !type.includes("fetch") &&
          !type.includes("login") &&
          (type.includes("create") ||
            type.includes("update") ||
            type.includes("delete") ||
            type.includes("cancel") ||
            type.includes("complete") ||
            type.includes("payment") ||
            type.includes("statusChange"))
        );
      },
      (state) => {
        state.fetched = false;
      }
    );
  },
});

export const {
  fetchDashboardDataRequest,
  fetchDashboardDataSuccess,
  fetchDashboardDataFailure,
  clearDashboardData,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
