import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stats: null,
  appointments: [],
  patients: [],
  prescriptions: [],
  staff: [],
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
      const { stats, appointments, patients, prescriptions, staff } = action.payload;
      if (stats) state.stats = stats;
      if (appointments) state.appointments = appointments;
      if (patients) state.patients = patients;
      if (prescriptions) state.prescriptions = prescriptions;
      if (staff) state.staff = staff;
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
      (action) => 
        action.type.endsWith("/success") || 
        action.type.includes("Success"),
      (state, action) => {
        // Only invalidate if the action DID NOT come from the dashboard itself
        if (!action.type.startsWith("dashboard/")) {
          state.fetched = false;
        }
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
