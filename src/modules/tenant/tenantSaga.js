import { call, put, takeLatest } from "redux-saga/effects";
import tenantAPI from "./tenantAPI";
import {
  fetchTenantInfoRequest,
  fetchTenantInfoSuccess,
  fetchTenantInfoFailure,
} from "./tenantSlice";

/**
 * Saga to fetch tenant configuration from the Master DB.
 */
function* fetchTenantInfoSaga() {
  try {
    const res = yield call(tenantAPI.getConfig);
    if (res.data.success) {
      yield put(fetchTenantInfoSuccess(res.data.data));
    } else {
      yield put(
        fetchTenantInfoFailure(res.data.message || "Failed to load tenant metadata")
      );
    }
  } catch (error) {
    yield put(
      fetchTenantInfoFailure(
        error.response?.data?.message || "Could not connect to Master DB"
      )
    );
  }
}

export default function* tenantSaga() {
  yield takeLatest(fetchTenantInfoRequest.type, fetchTenantInfoSaga);
}
