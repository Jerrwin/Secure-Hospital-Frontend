import { createSlice } from "@reduxjs/toolkit";

// ─── State Shape ──────────────────────────────────────────────────────────────
const initialState = {
  list: [],           // all appointments for the tenant
  upcoming: [],       // upcoming scheduled only
  selected: null,     // single appointment detail view
  patients: [],       // for dropdowns
  staff: [],          // for dropdowns
  loading: false,
  dropdownLoading: false,
  submitting: false,  // for create/update/cancel/complete
  fetched: false,
  error: null,
  submitError: null,
};

const appointmentSlice = createSlice({
  name: "appointments",
  initialState,

  reducers: {
    // ── FETCH ALL ──────────────────────────────────────────────────────────
    fetchAppointmentsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAppointmentsSuccess: (state, action) => {
      state.loading = false;
      state.fetched = true;
      state.list = action.payload;
    },
    fetchAppointmentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ── FETCH UPCOMING ─────────────────────────────────────────────────────
    fetchUpcomingRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUpcomingSuccess: (state, action) => {
      state.loading = false;
      state.upcoming = action.payload;
    },
    fetchUpcomingFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ── FETCH SINGLE ───────────────────────────────────────────────────────
    fetchAppointmentByIdRequest: (state) => {
      state.loading = true;
      state.selected = null;
      state.error = null;
    },
    fetchAppointmentByIdSuccess: (state, action) => {
      state.loading = false;
      state.selected = action.payload;
    },
    fetchAppointmentByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ── CREATE ─────────────────────────────────────────────────────────────
    createAppointmentRequest: (state) => {
      state.submitting = true;
      state.submitError = null;
    },
    createAppointmentSuccess: (state, action) => {
      state.submitting = false;
      state.list = [action.payload, ...state.list];
      state.fetched = false; // force re-fetch on next load
    },
    createAppointmentFailure: (state, action) => {
      state.submitting = false;
      state.submitError = action.payload;
    },

    // ── UPDATE ─────────────────────────────────────────────────────────────
    updateAppointmentRequest: (state) => {
      state.submitting = true;
      state.submitError = null;
    },
    updateAppointmentSuccess: (state, action) => {
      state.submitting = false;
      state.fetched = false; // force re-fetch so list refreshes
    },
    updateAppointmentFailure: (state, action) => {
      state.submitting = false;
      state.submitError = action.payload;
    },

    // ── CANCEL ─────────────────────────────────────────────────────────────
    cancelAppointmentRequest: (state) => {
      state.submitting = true;
      state.submitError = null;
    },
    cancelAppointmentSuccess: (state, action) => {
      state.submitting = false;
      // Revert to status update since there's no real "Delete" endpoint
      state.list = state.list.map((a) =>
        a.id === action.payload ? { ...a, STATUS: "cancelled" } : a
      );
    },
    cancelAppointmentFailure: (state, action) => {
      state.submitting = false;
      state.submitError = action.payload;
    },

    // ── COMPLETE ───────────────────────────────────────────────────────────
    completeAppointmentRequest: (state) => {
      state.submitting = true;
      state.submitError = null;
    },
    completeAppointmentSuccess: (state, action) => {
      state.submitting = false;
      state.list = state.list.map((a) =>
        a.id === action.payload ? { ...a, STATUS: "completed" } : a
      );
    },
    completeAppointmentFailure: (state, action) => {
      state.submitting = false;
      state.submitError = action.payload;
    },

    // ── FETCH DROPDOWN DATA ──────────────────────────────────────────────
    fetchDropdownDataRequest: (state) => {
      state.dropdownLoading = true;
      state.error = null;
    },
    fetchDropdownDataSuccess: (state, action) => {
      state.dropdownLoading = false;
      state.patients = action.payload.patients || [];
      state.staff = action.payload.staff || [];
    },
    fetchDropdownDataFailure: (state, action) => {
      state.dropdownLoading = false;
      state.error = action.payload;
    },

    // ── RESET ──────────────────────────────────────────────────────────────
    clearSubmitError: (state) => {
      state.submitError = null;
    },
    resetAppointments: () => initialState,
  },
});

export const {
  fetchAppointmentsRequest,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
  fetchUpcomingRequest,
  fetchUpcomingSuccess,
  fetchUpcomingFailure,
  fetchAppointmentByIdRequest,
  fetchAppointmentByIdSuccess,
  fetchAppointmentByIdFailure,
  createAppointmentRequest,
  createAppointmentSuccess,
  createAppointmentFailure,
  updateAppointmentRequest,
  updateAppointmentSuccess,
  updateAppointmentFailure,
  cancelAppointmentRequest,
  cancelAppointmentSuccess,
  cancelAppointmentFailure,
  completeAppointmentRequest,
  completeAppointmentSuccess,
  completeAppointmentFailure,
  fetchDropdownDataRequest,
  fetchDropdownDataSuccess,
  fetchDropdownDataFailure,
  clearSubmitError,
  resetAppointments,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;
