import { createSlice } from "@reduxjs/toolkit";

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
  providerId: null,
  appointments: [],   // completed appointments for doctor dropdown
  loading: false,
  prefetching: false,
  submitting: false,
  fetched: false,
  error: null,
};

const prescriptionSlice = createSlice({
  name: "prescription",
  initialState,
  reducers: {
    // ─── Paged Fetch ──────────────────────────────────────────────
    fetchPagedRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPagedSuccess: (state, action) => {
      state.loading = false;
      state.fetched = true;
      state.list = action.payload.data;
      const backendPagination = action.payload.pagination;
      if (backendPagination) {
        state.pagination = {
          currentPage: backendPagination.current_page,
          perPage: state.pagination.perPage,
          total: backendPagination.total,
          lastPage: backendPagination.last_page,
        };
      }
      state.buffer = [];
    },
    fetchPagedFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ─── Prefetch ─────────────────────────────────────────────────
    prefetchRequest: (state) => {
      state.prefetching = true;
    },
    prefetchSuccess: (state, action) => {
      state.prefetching = false;
      state.buffer = action.payload.data;
    },
    prefetchFailure: (state) => {
      state.prefetching = false;
    },

    setPage: () => {},
    moveBufferToList: (state, action) => {
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

    // ─── Legacy Fetch (keep for backward compatibility if needed) ──
    fetchRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.fetched = false; // Reset to trigger hook re-fetch
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
      state.loading = false; // Clear loading if started by fetchRequest
    },

    // ─── Create ───────────────────────────────────────────────────
    createRequest: (state) => {
      state.submitting = true;
      state.error = null;
    },
    createSuccess: (state, action) => {
      state.submitting = false;
      // Prepend to list but slice to perPage to avoid AntD "length > pageSize" warning
      state.list = [action.payload, ...state.list].slice(
        0,
        state.pagination.perPage
      );
      state.pagination.total += 1;
      state.fetched = false;
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
      state.fetched = false;
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
      state.fetched = false;
      // Also update locally to ensure immediate UI feedback
      const updated = action.payload;
      if (updated && updated.id) {
        state.list = state.list.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item
        );
      }
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
      state.fetched = false;
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