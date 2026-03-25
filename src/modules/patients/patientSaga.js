import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchPatientsAPI, fetchPatientByIdAPI, createPatientAPI, updatePatientAPI, deletePatientAPI } from './patientAPI';
import {
  fetchPagedRequest, fetchPagedSuccess, fetchPagedFailure,
  prefetchRequest, prefetchSuccess, prefetchFailure,
  setPage, moveBufferToList, setSearch, setStatus,
  fetchPatientsRequest, 
  fetchPatientByIdRequest, fetchPatientByIdSuccess, fetchPatientByIdFailure,
  createPatientRequest, createPatientSuccess, createPatientFailure,
  updatePatientRequest, updatePatientSuccess, updatePatientFailure,
  deletePatientRequest, deletePatientSuccess, deletePatientFailure
} from './patientSlice';
import { 
  fetchPagedSagaGenerator, 
  prefetchSagaGenerator, 
  handleSetPageSagaGenerator 
} from '../../utils/paginationSagaUtils';

// ── PAGINATION SAGAS (Centralized) ──────────────────────────────────────────
const stateSelector = (state) => state.patients;
const paginationActions = {
  fetchPagedRequest, fetchPagedSuccess, fetchPagedFailure,
  prefetchRequest, prefetchSuccess, prefetchFailure,
  setPage, moveBufferToList, setSearch, setStatus
};

function* fetchPagedPatientsSaga(action) {
  yield fetchPagedSagaGenerator({
    apiMethod: fetchPatientsAPI,
    actions: paginationActions,
    stateSelector,
    action
  });
}

function* prefetchPatientsSaga(action) {
  yield prefetchSagaGenerator({
    apiMethod: fetchPatientsAPI,
    actions: paginationActions,
    stateSelector,
    action
  });
}

function* handleSetPagePatientsSaga(action) {
  yield handleSetPageSagaGenerator({
    actions: paginationActions,
    stateSelector,
    action
  });
}

// ── STANDARD CRUD SAGAS ─────────────────────────────────────────────────────
function* fetchPatientsSaga() {
  // Fallback to paged fetch for page 1
  yield put(fetchPagedRequest(1));
}

function* fetchPatientByIdSaga(action) {
  try {
    const response = yield call(fetchPatientByIdAPI, action.payload);
    yield put(fetchPatientByIdSuccess(response.data || response));
  } catch (error) {
    yield put(fetchPatientByIdFailure(error.response?.data?.message || "Failed to fetch details"));
  }
}

function* createPatientSaga(action) {
  try {
    const response = yield call(createPatientAPI, action.payload);
    yield put(createPatientSuccess(response.data || response));
    yield put(fetchPagedRequest(1)); // Refresh first page
  } catch (error) {
    yield put(createPatientFailure(error.response?.data?.message || "Failed to create patient"));
  }
}

function* updatePatientSaga(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updatePatientAPI, action.payload);
    const updatedPatient = { id, ...data, ...(response?.data || {}) };
    yield put(updatePatientSuccess(updatedPatient));
  } catch (error) {
    yield put(updatePatientFailure(error.response?.data?.message || "Failed to update patient"));
  }
}

function* deletePatientSaga(action) {
  try {
    yield call(deletePatientAPI, action.payload);
    yield put(deletePatientSuccess(action.payload));
    yield put(fetchPagedRequest(1)); // Refresh
  } catch (error) {
    yield put(deletePatientFailure(error.response?.data?.message || "Failed to delete patient"));
  }
}

export default function* patientSaga() {
  // Pagination Watchers
  yield takeLatest(fetchPagedRequest.type, fetchPagedPatientsSaga);
  yield takeLatest(prefetchRequest.type, prefetchPatientsSaga);
  yield takeLatest(setPage.type, handleSetPagePatientsSaga);
  yield takeLatest(setSearch.type, fetchPagedPatientsSaga);
  yield takeLatest(setStatus.type, fetchPagedPatientsSaga);

  // Standard Watchers
  yield takeLatest(fetchPatientsRequest.type, fetchPatientsSaga);
  yield takeLatest(fetchPatientByIdRequest.type, fetchPatientByIdSaga);
  yield takeLatest(createPatientRequest.type, createPatientSaga);
  yield takeLatest(updatePatientRequest.type, updatePatientSaga);
  yield takeLatest(deletePatientRequest.type, deletePatientSaga);
}
