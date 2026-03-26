import { all, call, put, takeLatest } from 'redux-saga/effects';
import { fetchStaffAPI, addStaffAPI, updateStaffAPI, deleteStaffAPI } from './userAPI';
import {
  fetchPagedRequest, fetchPagedSuccess, fetchPagedFailure,
  prefetchRequest, prefetchSuccess, prefetchFailure,
  setPage, moveBufferToList, setSearch, setStatus,
  addStaffRequest, addStaffSuccess, addStaffFailure,
  updateStaffRequest, updateStaffSuccess, updateStaffFailure,
  deleteStaffRequest, deleteStaffSuccess, deleteStaffFailure
} from './userSlice';
import { 
  fetchPagedSagaGenerator, 
  prefetchSagaGenerator, 
  handleSetPageSagaGenerator 
} from "../../utils/paginationSagaUtils";

// ── PAGINATION SAGAS ──────────────────────────────────────────────────────────
const stateSelector = (state) => state.users;
const paginationActions = {
  fetchPagedRequest, fetchPagedSuccess, fetchPagedFailure,
  prefetchRequest, prefetchSuccess, prefetchFailure,
  setPage, moveBufferToList, setSearch, setStatus
};

function* fetchPagedStaffSaga(action) {
  yield fetchPagedSagaGenerator({
    apiMethod: fetchStaffAPI,
    actions: paginationActions,
    stateSelector,
    action
  });
}

function* prefetchStaffSaga(action) {
  yield prefetchSagaGenerator({
    apiMethod: fetchStaffAPI,
    actions: paginationActions,
    stateSelector,
    action
  });
}

function* handleSetPageStaffSaga(action) {
  yield handleSetPageSagaGenerator({
    actions: paginationActions,
    stateSelector,
    action
  });
}

// ── WRITE SAGAS ───────────────────────────────────────────────────────────────
function* addStaffSaga(action) {
  try {
    const response = yield call(addStaffAPI, action.payload);
    yield put(addStaffSuccess(response.data || response));
    // Trigger re-fetch of current page (page 1 for new staff)
    yield put(fetchPagedRequest(1));
  } catch (error) {
    yield put(addStaffFailure(error.response?.data?.message || "Failed to add staff member"));
  }
}

function* updateStaffSaga(action) {
  try {
    const response = yield call(updateStaffAPI, action.payload);
    const updatedData = { ...action.payload.data, ...(response.data || response) };
    yield put(updateStaffSuccess({ id: action.payload.id, ...updatedData }));
  } catch (error) {
    yield put(updateStaffFailure(error.response?.data?.message || "Failed to update staff member"));
  }
}

function* deleteStaffSaga(action) {
  try {
    yield call(deleteStaffAPI, action.payload);
    yield put(deleteStaffSuccess(action.payload)); // Pass ID
    // Trigger re-fetch of current page
    yield put(fetchPagedRequest());
  } catch (error) {
    yield put(deleteStaffFailure(error.response?.data?.message || "Failed to delete staff member"));
  }
}

export default function* userSaga() {
  yield all([
    takeLatest(fetchPagedRequest.type, fetchPagedStaffSaga),
    takeLatest(prefetchRequest.type, prefetchStaffSaga),
    takeLatest(setPage.type, handleSetPageStaffSaga),
    takeLatest(setSearch.type, fetchPagedStaffSaga), // Watch for search changes
    takeLatest(setStatus.type, fetchPagedStaffSaga), // Watch for status changes
    takeLatest(addStaffRequest.type, addStaffSaga),
    takeLatest(updateStaffRequest.type, updateStaffSaga),
    takeLatest(deleteStaffRequest.type, deleteStaffSaga),
  ]);
}
