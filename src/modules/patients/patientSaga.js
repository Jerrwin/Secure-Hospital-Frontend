import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchPatientsAPI, fetchPatientByIdAPI, createPatientAPI, updatePatientAPI, deletePatientAPI } from './patientAPI';
import {
  fetchPatientsRequest, fetchPatientsSuccess, fetchPatientsFailure,
  fetchPatientByIdRequest, fetchPatientByIdSuccess, fetchPatientByIdFailure,
  createPatientRequest, createPatientSuccess, createPatientFailure,
  updatePatientRequest, updatePatientSuccess, updatePatientFailure,
  deletePatientRequest, deletePatientSuccess, deletePatientFailure
} from './patientSlice';

function* fetchPatientsSaga() {
  try {
    const response = yield call(fetchPatientsAPI);
    yield put(fetchPatientsSuccess(response.data || response));
  } catch (error) {
    yield put(fetchPatientsFailure(error.response?.data?.message || "Failed to fetch patients"));
  }
}

function* fetchPatientByIdSaga(action) {
  try {
    const response = yield call(fetchPatientByIdAPI, action.payload);
    yield put(fetchPatientByIdSuccess(response.data || response));
  } catch (error) {
    yield put(fetchPatientByIdFailure(error.response?.data?.message || "Failed to fetch patient details"));
  }
}

function* createPatientSaga(action) {
  try {
    const response = yield call(createPatientAPI, action.payload);
    yield put(createPatientSuccess(response.data || response));
    // Re-fetch to guarantee state sync if needed
    yield put(fetchPatientsRequest());
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
    // Optional refresh
    yield put(fetchPatientsRequest());
  } catch (error) {
    yield put(updatePatientFailure(error.response?.data?.message || "Failed to update patient"));
  }
}

function* deletePatientSaga(action) {
  try {
    yield call(deletePatientAPI, action.payload);
    yield put(deletePatientSuccess(action.payload));
  } catch (error) {
    yield put(deletePatientFailure(error.response?.data?.message || "Failed to delete patient"));
  }
}

export default function* patientSaga() {
  yield takeLatest(fetchPatientsRequest.type, fetchPatientsSaga);
  yield takeLatest(fetchPatientByIdRequest.type, fetchPatientByIdSaga);
  yield takeLatest(createPatientRequest.type, createPatientSaga);
  yield takeLatest(updatePatientRequest.type, updatePatientSaga);
  yield takeLatest(deletePatientRequest.type, deletePatientSaga);
}
