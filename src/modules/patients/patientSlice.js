import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],          // current page data (visible in table)
  buffer: [],            // next page data (prefetched)
  pagination: {
    currentPage: 1,
    perPage: 5,          // Frontend enforces 5, backend delivers 5
    total: 0,
    lastPage: 1,
  },
  searchQuery: '',
  statusFilter: 'all',
  selectedPatient: null,
  loading: false,
  error: null,
  isLoaded: false,
  fetched: false,
};

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    // ── Paginated Fetching ───────────────────────────────────────────────────
    fetchPagedRequest(state, action) {
      state.loading = true;
      state.error = null;
      // action.payload is the target page number
    },
    fetchPagedSuccess(state, action) {
      state.loading = false;
      state.list = action.payload.data;
      
      const meta = action.payload.pagination;
      if (meta) {
        state.pagination = {
          ...state.pagination,
          currentPage: meta.current_page || state.pagination.currentPage,
          total: meta.total || 0,
          lastPage: meta.last_page || 1,
          perPage: 5,
        };
      }
      state.isLoaded = true;
      state.fetched = true;
    },
    fetchPagedFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ── Prefetching ──────────────────────────────────────────────────────────
    prefetchRequest(state, action) {
      // action.payload is the next page number
    },
    prefetchSuccess(state, action) {
      state.buffer = action.payload.data;
    },
    prefetchFailure(state) {
      state.buffer = [];
    },

    // ── Navigation & Filtering ───────────────────────────────────────────────
    setPage(state, action) {
      // Logic handled by Saga: 
      // 1. If swapping buffer, it calls moveBufferToList
      // 2. If full fetch, it calls fetchPagedRequest
      // We don't update state here to avoid timing issues in Saga
    },
    moveBufferToList(state, action) {
      const targetPage = action.payload;
      state.list = state.buffer;
      state.buffer = [];
      state.pagination.currentPage = targetPage;
      state.fetched = true;
    },
    setSearch(state, action) {
      state.searchQuery = action.payload;
      state.pagination.currentPage = 1; // Reset to page 1 on search
      state.fetched = false;
    },
    setStatus(state, action) {
      state.statusFilter = action.payload;
      state.pagination.currentPage = 1; // Reset to page 1 on filter
      state.fetched = false;
    },

    // ── Legacy/Standard Actions ──────────────────────────────────────────────
    fetchPatientsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchPatientsSuccess(state, action) {
      state.loading = false;
      state.list = action.payload;
      state.isLoaded = true;
    },
    fetchPatientsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    
    fetchPatientByIdRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchPatientByIdSuccess(state, action) {
      state.loading = false;
      state.selectedPatient = action.payload;
    },
    fetchPatientByIdFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    createPatientRequest(state) {
      state.loading = true;
      state.error = null;
    },
    createPatientSuccess(state, action) {
      state.loading = false;
      state.fetched = false;
      // If we are on page 1, we might want to refresh. 
      // For now, simpler to just push if small, but with pagination, 
      // a refresh is better.
    },
    createPatientFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    updatePatientRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    updatePatientSuccess(state, action) {
      state.loading = false;
      const index = state.list.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    updatePatientFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    deletePatientRequest(state) {
      state.loading = true;
      state.error = null;
    },
    deletePatientSuccess(state, action) {
      state.loading = false;
      state.list = state.list.filter(p => p.id !== action.payload);
      state.fetched = false; // Trigger refresh
    },
    deletePatientFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    clearPatientError(state) {
      state.error = null;
    },
    setSelectedPatient(state, action) {
      state.selectedPatient = action.payload;
    }
  }
});

export const {
  fetchPagedRequest, fetchPagedSuccess, fetchPagedFailure,
  prefetchRequest, prefetchSuccess, prefetchFailure,
  setPage, moveBufferToList, setSearch, setStatus,
  fetchPatientsRequest, fetchPatientsSuccess, fetchPatientsFailure,
  fetchPatientByIdRequest, fetchPatientByIdSuccess, fetchPatientByIdFailure,
  createPatientRequest, createPatientSuccess, createPatientFailure,
  updatePatientRequest, updatePatientSuccess, updatePatientFailure,
  deletePatientRequest, deletePatientSuccess, deletePatientFailure,
  clearPatientError, setSelectedPatient
} = patientSlice.actions;

export default patientSlice.reducer;
