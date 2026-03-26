import { createSlice } from '@reduxjs/toolkit';

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
  staffList: [],      // legacy fallback
  loading: false,
  prefetching: false,
  submitting: false,
  fetched: false,
  isLoaded: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
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
      state.isLoaded = true;
      state.list = action.payload.data;
      state.staffList = action.payload.data; // sync legacy field

      const backendPagination = action.payload.pagination;
      state.pagination = {
        currentPage: backendPagination.current_page,
        perPage: state.pagination.perPage,
        total: backendPagination.total,
        lastPage: backendPagination.last_page,
      };
      state.buffer = []; 
    },
    fetchPagedFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ── PREFETCH ──────────────────────────────────────────────────────────
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

    setPage: () => {}, // intercepted by saga

    moveBufferToList: (state, action) => {
      state.list = state.buffer;
      state.staffList = state.buffer; // sync legacy
      state.buffer = [];
      state.pagination.currentPage = action.payload;
      state.fetched = true;
    },

    setSearch: (state, action) => {
      state.searchQuery = action.payload;
      state.pagination.currentPage = 1;
    },
    setStatus: (state, action) => {
      state.statusFilter = action.payload;
      state.pagination.currentPage = 1;
    },

    // ── LEGACY FETCH (Fallback) ──────────────────────────────────────────
    fetchStaffRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchStaffSuccess(state, action) {
      state.loading = false;
      state.staffList = action.payload;
      state.isLoaded = true;
    },
    fetchStaffFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ── WRITE ACTIONS ─────────────────────────────────────────────────────
    addStaffRequest(state) {
      state.submitting = true;
      state.error = null;
    },
    addStaffSuccess(state) {
      state.submitting = false;
      state.fetched = false; // force re-fetch
    },
    addStaffFailure(state, action) {
      state.submitting = false;
      state.error = action.payload;
    },

    updateStaffRequest(state) {
      state.submitting = true;
      state.error = null;
    },
    updateStaffSuccess(state, action) {
      state.submitting = false;
      state.fetched = false; // force re-fetch
      
      const updatedUser = action.payload;
      if (updatedUser && updatedUser.id) {
        state.list = state.list.map(user => 
          String(user.id) === String(updatedUser.id) ? { ...user, ...updatedUser } : user
        );
        state.staffList = [...state.list];
      }
    },
    updateStaffFailure(state, action) {
      state.submitting = false;
      state.error = action.payload;
    },

    deleteStaffRequest(state) {
      state.submitting = true;
      state.error = null;
    },
    deleteStaffSuccess(state, action) {
      state.submitting = false;
      state.fetched = false; // force re-fetch
      
      const id = action.payload;
      if (id) {
        state.list = state.list.filter(item => String(item.id) !== String(id));
        state.staffList = [...state.list];
      }
    },
    deleteStaffFailure(state, action) {
      state.submitting = false;
      state.error = action.payload;
    },

    clearError(state) {
      state.error = null;
    }
  }
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
  fetchStaffRequest,
  fetchStaffSuccess,
  fetchStaffFailure,
  addStaffRequest,
  addStaffSuccess,
  addStaffFailure,
  updateStaffRequest,
  updateStaffSuccess,
  updateStaffFailure,
  deleteStaffRequest,
  deleteStaffSuccess,
  deleteStaffFailure,
  clearError
} = userSlice.actions;

export default userSlice.reducer;
