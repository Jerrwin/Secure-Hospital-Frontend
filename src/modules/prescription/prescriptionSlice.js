import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  appointments: [], // completed appointments for doctor dropdown
  loading: false,
  submitting: false,
  error: null,
};

const prescriptionSlice = createSlice({
  name: "prescription",
  initialState,
  reducers: {
    // ─── Fetch ────────────────────────────────────────────────────
    fetchRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess: (state, action) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ─── Appointments (for doctor dropdown) ───────────────────────
    fetchAppointmentsSuccess: (state, action) => {
      state.appointments = action.payload;
    },

    // ─── Create ───────────────────────────────────────────────────
    createRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    createSuccess: (state, action) => {
      state.submitting = false;
      state.list = [action.payload, ...state.list];
    },
    createFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    // ─── Update ───────────────────────────────────────────────────
    updateRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    updateSuccess: (state, action) => {
      state.submitting = false;
      state.list = state.list.map((p) =>
        p.id === action.payload.id ? action.payload : p
      );
    },
    updateFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    // ─── Status Change (verify / dispense / cancel) ───────────────
    statusChangeRequest: (state) => {
      state.submitting = true;
    },
    statusChangeSuccess: (state, action) => {
      state.submitting = false;
      state.list = state.list.map((p) =>
        p.id === action.payload.id ? action.payload : p
      );
    },
    statusChangeFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    // ─── Delete ───────────────────────────────────────────────────
    deleteRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    deleteSuccess: (state, action) => {
      state.submitting = false;
      state.list = state.list.filter((p) => p.id !== action.payload);
    },
    deleteFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchRequest,
  fetchSuccess,
  fetchFailure,
  fetchAppointmentsSuccess,
  createRequest,
  createSuccess,
  createFailure,
  updateRequest,
  updateSuccess,
  updateFailure,
  statusChangeRequest,
  statusChangeSuccess,
  statusChangeFailure,
  deleteRequest,
  deleteSuccess,
  deleteFailure,
  clearError,
} = prescriptionSlice.actions;

export default prescriptionSlice.reducer;