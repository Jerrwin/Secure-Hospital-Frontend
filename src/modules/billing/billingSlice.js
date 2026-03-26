import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],           // current page results
  buffer: [],         // prefetched next page
  pagination: {
    currentPage: 1,
    perPage: 5,       // fixed
    total: 0,
    lastPage: 1,
  },
  searchQuery: "",
  statusFilter: "unbilled", // default to unbilled to match initial page tab
  invoices: [], 
  sessionBilledIds: [], 
  selectedInvoice: null,
  loading: false,
  prefetching: false,
  submitting: false,
  createSuccess: false,
  paymentSuccess: false,
  error: null,
  submitError: null,
  fetched: false,
};

const billingSlice = createSlice({
  name: "billing",
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
      
      // Deduplicate by ID as a defensive measure
      const rawData = action.payload.data || [];
      const seen = new Set();
      state.list = rawData.filter(item => {
        const id = item.id || item.ID || item.invoice_id || item.invoiceId || item.INVOICE_ID || item.appointment_id || item.APPOINTMENT_ID;
        if (!id || seen.has(String(id))) return false;
        seen.add(String(id));
        return true;
      });

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
      state.fetched = true; // Stop loop on error
    },

    // ── PREFETCH ───────────────────────────────────────────────────────────
    prefetchRequest: (state) => {
      state.prefetching = true;
    },
    prefetchSuccess: (state, action) => {
      state.prefetching = false;
      
      // Deduplicate by ID
      const rawData = action.payload.data || [];
      const seen = new Set();
      state.buffer = rawData.filter(item => {
        const id = item.id || item.ID || item.invoice_id || item.INVOICE_ID || item.appointment_id || item.APPOINTMENT_ID;
        if (!id || seen.has(String(id))) return false;
        seen.add(String(id));
        return true;
      });
    },
    prefetchFailure: (state) => {
      state.prefetching = false;
    },

    setPage: () => {}, // Handled by saga
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
      state.pagination.total = 0;
      state.pagination.lastPage = 1;
      state.list = [];
      state.buffer = [];
      state.fetched = false;
    },
    setStatus: (state, action) => {
      if (state.statusFilter === action.payload) return;
      state.statusFilter = action.payload;
      state.pagination.currentPage = 1;
      state.pagination.total = 0;
      state.pagination.lastPage = 1;
      state.list = [];
      state.buffer = [];
      state.fetched = false;
    },

    // Fetch Invoices (Manual/Legacy)
    fetchInvoicesRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.fetched = false; // Add reset to fix refresh button logic too
    },
    fetchInvoicesSuccess: (state, action) => {
      state.loading = false;
      const data = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
      state.invoices = data;
      state.fetched = true;
    },
    fetchInvoicesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Specific Fetch Successes (to avoid overwriting main list if filtered)
    fetchPendingInvoicesSuccess: (state, action) => {
      state.loading = false;
      const data = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
      state.pendingInvoices = data;
    },
    fetchPaidInvoicesSuccess: (state, action) => {
      state.loading = false;
      const data = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
      state.paidInvoices = data;
    },


    // Create Invoice
    createInvoiceRequest: (state) => {
      state.submitting = true;
      state.submitError = null;
      state.createSuccess = false;
    },
    createInvoiceSuccess: (state, action) => {
      state.submitting = false;
      state.createSuccess = true;
      const newInvoice = action.payload;
      state.invoices = [newInvoice, ...state.invoices];
      
      // Track this appointment ID locally to hide it immediately and persistently
      const appId = newInvoice.appointment_id || newInvoice.appointmentId || newInvoice.APPOINTMENT_ID;
      if (appId && !state.sessionBilledIds.includes(String(appId))) {
        state.sessionBilledIds.push(String(appId));
      }
    },
    createInvoiceFailure: (state, action) => {
      state.submitting = false;
      state.submitError = action.payload;
    },

    // Process Payment
    processPaymentRequest: (state) => {
      state.submitting = true;
      state.submitError = null;
      state.paymentSuccess = false;
    },
    processPaymentSuccess: (state, action) => {
      state.submitting = false;
      state.paymentSuccess = true;
      const paidInvoice = action.payload;
      if (paidInvoice) {
        const invId =
          paidInvoice.invoice_id ||
          paidInvoice.invoiceId ||
          paidInvoice.INVOICE_ID ||
          paidInvoice.id;
        // Update local state to reflect 'paid' status immediately
        state.invoices = state.invoices.map((inv) => {
          if (String(inv.id || inv.Id) === String(invId)) {
            return { ...inv, STATUS: "paid", status: "paid" };
          }
          return inv;
        });
      }
    },
    processPaymentFailure: (state, action) => {
      state.submitting = false;
      state.submitError = action.payload;
    },

    clearBillingError: (state) => {
      state.error = null;
      state.submitError = null;
      state.createSuccess = false;
      state.paymentSuccess = false;
    },
    resetBilling: () => initialState,
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
  fetchInvoicesRequest,
  fetchInvoicesSuccess,
  fetchInvoicesFailure,
  fetchPendingInvoicesSuccess,
  fetchPaidInvoicesSuccess,
  createInvoiceRequest,
  createInvoiceSuccess,
  createInvoiceFailure,
  processPaymentRequest,
  processPaymentSuccess,
  processPaymentFailure,
  clearBillingError,
  resetBilling,
} = billingSlice.actions;

export default billingSlice.reducer;
