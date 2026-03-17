import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stats: null,
  appointments: [],
  patients: [],
  prescriptions: [],
  staff: [],
  loading: false,
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
      const { stats, appointments, patients, prescriptions, staff } = action.payload;
      if (stats) state.stats = stats;
      if (appointments) state.appointments = appointments;
      if (patients) state.patients = patients;
      if (prescriptions) state.prescriptions = prescriptions;
      if (staff) state.staff = staff;
    },
    fetchDashboardDataFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearDashboardData: (state) => {
      return initialState;
    },
  },
});

export const {
  fetchDashboardDataRequest,
  fetchDashboardDataSuccess,
  fetchDashboardDataFailure,
  clearDashboardData,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
