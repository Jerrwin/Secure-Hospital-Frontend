import { createSlice } from "@reduxjs/toolkit";

// ─── State Shape ──────────────────────────────────────────────────────────────
const initialState = {
  list: [],           // current page results
  buffer: [],         // prefetched next page results
  pagination: {
    currentPage: 1,
    perPage: 5,       // fixed as per user requirement
    total: 0,
    lastPage: 1,
  },
  searchQuery: "",
  statusFilter: "all",
  providerId: null,      // for Doctor/Provider role-based filtering
  upcoming: [],       // upcoming scheduled only (usually for dashboard/small widgets)
  selected: null,     // single appointment detail view
  patients: [],       // for dropdowns
  staff: [],          // for dropdowns
  loading: false,
  prefetching: false,
  dropdownLoading: false,
  submitting: false,  // for create/update/cancel/complete
  fetched: false,
  dropdownFetched: false,
  error: null,
  submitError: null,
};

const appointmentSlice = createSlice({
  name: "appointments",
  initialState,

  reducers: {
    // ── FETCH PAGED ───────────────────────────────────────────────────────
    fetchPagedRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPagedSuccess: (state, action) => {
      state.loading = false;
      state.fetched = true;
      
      // Deduplicate by ID
      const rawData = action.payload.data || [];
      const seen = new Set();
      state.list = rawData.filter(item => {
        const id = item.id || item.ID || item.appointment_id || item.appointmentId || item.APPOINTMENT_ID;
        if (!id || seen.has(String(id))) return false;
        seen.add(String(id));
        return true;
      });

      // Map backend keys to our camelCase keys, but PRESERVE our fixed perPage
      const backendPagination = action.payload.pagination;
      if (backendPagination) {
        state.pagination = {
          currentPage: backendPagination.current_page,
          perPage: state.pagination.perPage, // KEEP our fixed 5, ignore backend's 15
          total: backendPagination.total,
          lastPage: backendPagination.last_page,
        };
      }
      // Clear buffer until next prefetch finishes
      state.buffer = []; 
    },
    fetchPagedFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ── PREFETCH NEXT PAGE ─────────────────────────────────────────────────
    prefetchRequest: (state) => {
      state.prefetching = true;
    },
    prefetchSuccess: (state, action) => {
      state.prefetching = false;
      state.buffer = action.payload.data;
    },
    prefetchFailure: (state) => {
      state.prefetching = false;
      // We don't necessarily show an error for prefetch failure, 
      // just let the next real request handle it
    },

    // setPage is dispatched by the UI when user clicks a page number.
    // It does NOT update currentPage here — the handleSetPageSaga will
    // decide whether to swap from buffer or fetch fresh, and the saga
    // dispatches fetchPagedSuccess or moveBufferToList which update currentPage.
    setPage: () => {
      // no-op reducer — the saga intercepts this action
    },
    moveBufferToList: (state, action) => {
      // action.payload = targetPage
      state.list = state.buffer;
      state.buffer = [];
      state.pagination.currentPage = action.payload;
      state.fetched = true;
    },
    setSearch: (state, action) => {
      if (state.searchQuery === action.payload) return;
      state.searchQuery = action.payload;
      state.pagination.currentPage = 1;
      state.fetched = false;
    },
    setStatus: (state, action) => {
      if (state.statusFilter === action.payload) return;
      state.statusFilter = action.payload;
      state.pagination.currentPage = 1;
      state.fetched = false;
    },
    setProviderId: (state, action) => {
      if (state.providerId === action.payload) return;
      state.providerId = action.payload;
      state.pagination.currentPage = 1;
      state.fetched = false;
    },

    // ── FETCH ALL (Legacy/Fallback) ────────────────────────────────────────
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
      state.dropdownFetched = true;
      state.patients = action.payload.patients || [];
      state.staff = action.payload.staff || [];
    },
    fetchDropdownDataFailure: (state, action) => {
      state.dropdownLoading = false;
      state.dropdownFetched = true;
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
  fetchPagedRequest,
  fetchPagedSuccess,
  fetchPagedFailure,
  prefetchRequest,
  prefetchSuccess,
  prefetchFailure,
  setPage,
  moveBufferToList,
  setSearch,
  setStatus,
  setProviderId,
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
