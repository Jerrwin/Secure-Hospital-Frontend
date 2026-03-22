import { call, put, takeLatest } from "redux-saga/effects";
import dashboardAPI from "./dashboardAPI";
import {
  fetchDashboardDataRequest,
  fetchDashboardDataSuccess,
  fetchDashboardDataFailure,
} from "./dashboardSlice";

function* fetchDashboardDataSaga(action) {
  try {
    // The backend now returns ALL role-specific data in a single endpoint.
    // No need for multiple parallel calls — the controller handles switching by role.
    const statsRes = yield call(dashboardAPI.getStats);

    if (statsRes.data.success) {
      const payload = statsRes.data.data;

      yield put(
        fetchDashboardDataSuccess({
          stats: payload.stats || null,
          appointments: payload.appointments || [],
          prescriptions: payload.prescriptions || [],
          weekly_trend: payload.weekly_trend || [],
          // Preserve legacy fields
          patients: [],
          staff: [],
        })
      );
    } else {
      yield put(fetchDashboardDataFailure(statsRes.data.message || "Failed to load dashboard."));
    }
  } catch (error) {
    yield put(
      fetchDashboardDataFailure(
        error.response?.data?.message || "Failed to fetch dashboard data"
      )
    );
  }
}

export default function* dashboardSaga() {
  yield takeLatest(fetchDashboardDataRequest.type, fetchDashboardDataSaga);
}
