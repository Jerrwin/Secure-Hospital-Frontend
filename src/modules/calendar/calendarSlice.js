import { createSlice } from "@reduxjs/toolkit";

// ─── State Shape ──────────────────────────────────────────────────────────────
const initialState = {
  rangeData: [],       // [{ date, total_appointments, appointments[] }]
  tooltipData: [],     // [{ date, time, status, patient, doctor }]
  rangeLoading: false,
  tooltipLoading: false,
  error: null,
};

const calendarSlice = createSlice({
  name: "calendar",
  initialState,

  reducers: {
    // ── FETCH RANGE (month view) ───────────────────────────────────────────
    fetchCalendarRangeRequest: (state) => {
      state.rangeLoading = true;
      state.error = null;
    },
    fetchCalendarRangeSuccess: (state, action) => {
      state.rangeLoading = false;
      state.rangeData = action.payload;
    },
    fetchCalendarRangeFailure: (state, action) => {
      state.rangeLoading = false;
      state.error = action.payload;
    },

    // ── FETCH BY DATE (tooltip) ────────────────────────────────────────────
    fetchCalendarByDateRequest: (state) => {
      state.tooltipLoading = true;
      state.error = null;
    },
    fetchCalendarByDateSuccess: (state, action) => {
      state.tooltipLoading = false;
      state.tooltipData = action.payload;
    },
    fetchCalendarByDateFailure: (state, action) => {
      state.tooltipLoading = false;
      state.error = action.payload;
    },

    // ── CLEAR TOOLTIP ──────────────────────────────────────────────────────
    clearTooltipData: (state) => {
      state.tooltipData = [];
    },
  },
});

export const {
  fetchCalendarRangeRequest,
  fetchCalendarRangeSuccess,
  fetchCalendarRangeFailure,
  fetchCalendarByDateRequest,
  fetchCalendarByDateSuccess,
  fetchCalendarByDateFailure,
  clearTooltipData,
} = calendarSlice.actions;

export default calendarSlice.reducer;
