import { call, put, takeLatest, all } from "redux-saga/effects";
import dashboardAPI from "./dashboardAPI";
import {
  fetchDashboardDataRequest,
  fetchDashboardDataSuccess,
  fetchDashboardDataFailure,
} from "./dashboardSlice";

function* fetchDashboardDataSaga(action) {
  try {
    const role = action.payload?.role?.toUpperCase();
    
    // 1. Fetch primary dashboard stats 
    // This endpoint handles the main counts (stat cards) automatically by token.
    const statsRes = yield call(dashboardAPI.getStats);
    let payload = statsRes.data.success ? statsRes.data.data : {};

    // 2. Fetch Detailed Lists (Appointments & Prescriptions)
    // We make these resilient so one restricted endpoint won't break the entire dashboard.
    if (role === "PATIENT") {
       try {
         // Appointments always use the 'upcoming' endpoint for patients
         const aptRes = yield call(dashboardAPI.getUpcomingAppointments);
         if (aptRes.data?.success) payload.appointments = aptRes.data.data;
       } catch (e) { console.error("Could not fetch patient appointments:", e); }

       // IMPORTANT: patients use the combined stats endpoint for lists as standard fetch is 403
       // If the stats endpoint already has them, we don't need a sequential call.
       // Only fetch if stats didn't provide a list.
       if (!payload.prescriptions || payload.prescriptions.length === 0) {
         try {
           // Fallback check to see if there's a specialized patient list
           // If this still fails, we'll rely on the Stats provided data.
         } catch (e) { }
       }
    } else {
      // Standard fetch logic for medical staff / admins
      try {
        const [aptRes, presRes] = yield all([
          call(dashboardAPI.getUpcomingAppointments),
          call(dashboardAPI.getPrescriptions)
        ]);
        if (aptRes.data?.success) payload.appointments = aptRes.data.data;
        if (presRes.data?.success) payload.prescriptions = presRes.data.data;
      } catch (e) { console.error("Error fetching staff dashboard lists:", e); }
    }

    yield put(
      fetchDashboardDataSuccess({
        stats: payload.stats || payload,
        appointments: payload.appointments || [],
        prescriptions: payload.prescriptions || [],
        weekly_trend: payload.weekly_trend || [],
        patients: [],
        staff: [],
      })
    );
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
