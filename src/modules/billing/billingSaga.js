import { call, put, takeLatest, all, select } from "redux-saga/effects";
import billingAPI from "./billingAPI";
import { 
  handleSetPageSagaGenerator 
} from "../../utils/paginationSagaUtils";
import {
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
  createInvoiceRequest,
  createInvoiceSuccess,
  createInvoiceFailure,
  processPaymentRequest,
  processPaymentSuccess,
  processPaymentFailure,
} from "./billingSlice";

const stateSelector = (state) => state.billing;
const paginationActions = {
  fetchPagedRequest, fetchPagedSuccess, fetchPagedFailure,
  prefetchRequest, prefetchSuccess, prefetchFailure,
  setPage, moveBufferToList, setSearch, setStatus
};

function* fetchPagedInvoicesSaga(action) {
  try {
    const state = yield select(stateSelector);
    const { perPage } = state.pagination;
    const { searchQuery, statusFilter } = state;
    const page = action.payload || state.pagination.currentPage;

    console.log(`[billingSaga] Fetching paged invoices. Page: ${page}, Status: ${statusFilter}, Search: ${searchQuery}`);

    const auth = yield select((state) => state.auth);
    const userRole = (auth.user?.role || "").toUpperCase();
    const patientRoleId = 6; // From useAuth.js

    const params = {
      page,
      per_page: perPage,
      search: searchQuery || undefined,
      status: (statusFilter === "all" || statusFilter === "unbilled") ? undefined : statusFilter,
    };

    // If user is a patient, strictly filter by their patient ID
    if (userRole === "PATIENT" || auth.user?.role_id === patientRoleId) {
      params.patient_id = auth.user.id;
    }

    const apiMethod = statusFilter === "unbilled" 
      ? billingAPI.getCompletedAppointments 
      : billingAPI.getInvoices;

    const res = yield call(apiMethod, params);
    let data = res.data;
    
    // Normalize: If raw array, wrap it.
    if (Array.isArray(data)) {
        console.log(`[billingSaga] Received raw array of ${data.length} items`);
        // If it's a raw array, we simulate pagination. 
        // If it's full (length === perPage), we assume there's a next page.
        data = { 
          success: true, 
          data: data, 
          pagination: { 
            current_page: page, 
            last_page: data.length >= perPage ? page + 1 : page, 
            total: data.length 
          } 
        };
    }

    if (data.success) {
      let finalData = data.data || [];
      
      // Enforce perPage limit strictly if backend is misbehaving
      if (finalData.length > perPage) {
        console.log(`[billingSaga] Backend returned ${finalData.length} items, slicing to ${perPage}`);
        finalData = finalData.slice(0, perPage);
      }
      
      // RESTORE: Fetch complete details if only IDs/minimal data are returned
      const firstItem = finalData.length > 0 ? finalData[0] : null;
      const hasInvoiceId = firstItem && (firstItem.invoice_id || firstItem.INVOICE_ID);
      const hasAmount = firstItem && (firstItem.amount !== undefined || firstItem.AMOUNT !== undefined);
      if (hasInvoiceId && !hasAmount) {
        console.log(`[billingSaga] Fetching missing details for ${finalData.length} invoices`);
        const completeInvoices = [];
        for (const invoice of finalData) {
          try {
            const invId = invoice.invoice_id || invoice.INVOICE_ID;
            const detailRes = yield call(billingAPI.getInvoiceById, invId);
            completeInvoices.push(detailRes.data.success ? detailRes.data.data : detailRes.data);
          } catch (e) {
            completeInvoices.push(invoice);
          }
        }
        finalData = completeInvoices;
      }

      console.log(`[billingSaga] Dispatching fetchPagedSuccess with ${finalData.length} items`);
      
      // Normalize: if unbilled appointments, ensure they have name fields for the UI
      if (statusFilter === "unbilled") {
        finalData = finalData.map(app => ({
          ...app,
          patient_name: app.patient_name || app.patientName || (app.patient ? `${app.patient.first_name || ""} ${app.patient.last_name || ""}`.trim() : null),
          provider_name: app.provider_name || app.providerName || (app.provider ? `${app.provider.first_name || app.provider.name || ""} ${app.provider.last_name || ""}`.trim() : null),
          provider_id: app.provider_id || (app.provider ? app.provider.id : null),
          patient_id: app.patient_id || (app.patient ? app.patient.id : null),
        }));
      }

      yield put(fetchPagedSuccess({ data: finalData, pagination: data.pagination }));
      
      // Auto-trigger prefetch for next page
      if (data.pagination && data.pagination.current_page < data.pagination.last_page) {
        console.log(`[billingSaga] Triggering prefetch for page ${data.pagination.current_page + 1}`);
        yield put(prefetchRequest(data.pagination.current_page + 1));
      }
    } else {
      yield put(fetchPagedFailure(data.message || "Fetch failed"));
    }
  } catch (e) {
    console.error("[billingSaga] Error in fetchPagedInvoicesSaga:", e);
    yield put(fetchPagedFailure(e.message));
  }
}

function* prefetchSaga(action) {
  try {
    const state = yield select(stateSelector);
    const { perPage } = state.pagination;
    const { searchQuery, statusFilter } = state;
    const page = action.payload;

    console.log(`[billingSaga] Prefetching page ${page}`);

    const auth = yield select((state) => state.auth);
    const userRole = (auth.user?.role || "").toUpperCase();
    const patientRoleId = 6;

    const params = {
      page,
      per_page: perPage,
      search: searchQuery || undefined,
      status: (statusFilter === "all" || statusFilter === "unbilled") ? undefined : statusFilter,
    };

    if (userRole === "PATIENT" || auth.user?.role_id === patientRoleId) {
      params.patient_id = auth.user.id;
    }
    
    const apiMethod = statusFilter === "unbilled" 
      ? billingAPI.getCompletedAppointments 
      : billingAPI.getInvoices;

    const res = yield call(apiMethod, params);
    let data = res.data;
    if (Array.isArray(data)) data = { success: true, data: data };

    if (data.success) {
      let finalData = data.data || [];
      if (finalData.length > perPage) finalData = finalData.slice(0, perPage);

       // Fetch complete details if needed
       const firstPrefetchItem = finalData.length > 0 ? finalData[0] : null;
       const prefetchHasInvoiceId = firstPrefetchItem && (firstPrefetchItem.invoice_id || firstPrefetchItem.INVOICE_ID);
       const prefetchHasAmount = firstPrefetchItem && (firstPrefetchItem.amount !== undefined || firstPrefetchItem.AMOUNT !== undefined);
       if (prefetchHasInvoiceId && !prefetchHasAmount) {
        const completeInvoices = [];
        for (const invoice of finalData) {
           try {
             const invId = invoice.invoice_id || invoice.INVOICE_ID;
             const detailRes = yield call(billingAPI.getInvoiceById, invId);
             completeInvoices.push(detailRes.data.success ? detailRes.data.data : detailRes.data);
           } catch (e) {
             completeInvoices.push(invoice);
           }
        }
        finalData = completeInvoices;
      }
      console.log(`[billingSaga] Prefetch success. Storing ${finalData.length} items in buffer.`);
      
      // Normalize: if unbilled appointments, ensure they have name fields
      if (statusFilter === "unbilled") {
        finalData = finalData.map(app => ({
          ...app,
          patient_name: app.patient_name || app.patientName || (app.patient ? `${app.patient.first_name || ""} ${app.patient.last_name || ""}`.trim() : null),
          provider_name: app.provider_name || app.providerName || (app.provider ? `${app.provider.first_name || app.provider.name || ""} ${app.provider.last_name || ""}`.trim() : null),
          provider_id: app.provider_id || (app.provider ? app.provider.id : null),
          patient_id: app.patient_id || (app.patient ? app.patient.id : null),
        }));
      }

      yield put(prefetchSuccess({ data: finalData }));
    } else {
      yield put(prefetchFailure());
    }
  } catch (e) {
    yield put(prefetchFailure());
  }
}


function* createInvoiceSaga(action) {
  try {
    const res = yield call(billingAPI.createInvoice, action.payload);
    const data = res.data.success ? res.data.data : res.data;
    
    if (res.data.success || data) {
      yield put(createInvoiceSuccess(data));
      // Re-fetch to ensure all tabs are in sync with server data
      yield put(fetchInvoicesRequest());
    } else {
      yield put(createInvoiceFailure("Failed to create invoice"));
    }
  } catch (error) {
    if (error.isOfflineQueued) {
      yield put(createInvoiceFailure("OFFLINE_QUEUED"));
    } else {
      yield put(createInvoiceFailure(error.response?.data?.message || "Error creating invoice"));
    }
  }
}

function* processPaymentSaga(action) {
  try {
    const res = yield call(billingAPI.processPayment, action.payload);
    const data = res.data.success ? res.data.data : res.data;
    
    if (res.data.success || data) {
      yield put(processPaymentSuccess(data));
      // Re-fetch to ensure the "Completed Payments" tab is updated immediately
      yield put(fetchInvoicesRequest());
    } else {
      yield put(processPaymentFailure("Failed to process payment"));
    }
  } catch (error) {
    if (error.isOfflineQueued) {
      yield put(processPaymentFailure("OFFLINE_QUEUED"));
    } else {
      yield put(processPaymentFailure(error.response?.data?.message || "Error processing payment"));
    }
  }
}

function* handleSetPageSaga(action) {
  yield handleSetPageSagaGenerator({
    actions: paginationActions,
    stateSelector,
    action
  });
}

export default function* billingSaga() {
  yield all([
    takeLatest(fetchPagedRequest.type, fetchPagedInvoicesSaga),
    takeLatest(prefetchRequest.type, prefetchSaga),
    takeLatest(setPage.type, handleSetPageSaga),
    takeLatest(fetchInvoicesRequest.type, fetchPagedInvoicesSaga),
    takeLatest(createInvoiceRequest.type, createInvoiceSaga),
    takeLatest(processPaymentRequest.type, processPaymentSaga),
  ]);
}
