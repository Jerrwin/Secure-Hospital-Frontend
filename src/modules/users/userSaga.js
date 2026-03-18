import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchStaffAPI, addStaffAPI, updateStaffAPI, deleteStaffAPI } from './userAPI';
import {
  fetchStaffRequest, fetchStaffSuccess, fetchStaffFailure,
  addStaffRequest, addStaffSuccess, addStaffFailure,
  updateStaffRequest, updateStaffSuccess, updateStaffFailure,
  deleteStaffRequest, deleteStaffSuccess, deleteStaffFailure
} from './userSlice';

function* fetchStaffSaga() {
  try {
    const response = yield call(fetchStaffAPI);
    yield put(fetchStaffSuccess(response.data || response));
  } catch (error) {
    yield put(fetchStaffFailure(error.response?.data?.message || "Failed to fetch staff list"));
  }
}

function* addStaffSaga(action) {
  try {
    const response = yield call(addStaffAPI, action.payload);
    yield put(addStaffSuccess(response.data || response));
    // Re-fetch to guarantee all computed fields from server are present
    yield put(fetchStaffRequest());
  } catch (error) {
    yield put(addStaffFailure(error.response?.data?.message || "Failed to add staff member"));
  }
}

function* updateStaffSaga(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateStaffAPI, action.payload);
    // Merge the updated data with the response, ensuring 'id' is preserved
    const updatedRecord = { id, ...data, ...(response?.data || {}) };
    yield put(updateStaffSuccess(updatedRecord));
    // Optional re-fetch to be safe
    yield put(fetchStaffRequest());
  } catch (error) {
    yield put(updateStaffFailure(error.response?.data?.message || "Failed to update staff member"));
  }
}

function* deleteStaffSaga(action) {
  try {
    yield call(deleteStaffAPI, action.payload);
    yield put(deleteStaffSuccess(action.payload));
  } catch (error) {
    yield put(deleteStaffFailure(error.response?.data?.message || "Failed to delete staff member"));
  }
}

export default function* userSaga() {
  yield takeLatest(fetchStaffRequest.type, fetchStaffSaga);
  yield takeLatest(addStaffRequest.type, addStaffSaga);
  yield takeLatest(updateStaffRequest.type, updateStaffSaga);
  yield takeLatest(deleteStaffRequest.type, deleteStaffSaga);
}
