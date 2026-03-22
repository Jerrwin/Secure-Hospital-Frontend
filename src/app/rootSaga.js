import authSaga from "../modules/auth/authSaga";
import dashboardSaga from "../modules/dashboard/dashboardSaga";
import appointmentSaga from "../modules/appointments/appointmentSaga";
import userSaga from "../modules/users/userSaga";
import calendarSaga from "../modules/calendar/calendarSaga";
import chatSaga from "../modules/chat/chatSaga";
import tenantSaga from "../modules/tenant/tenantSaga";
import prescriptionSaga from "../modules/prescription/prescriptionSaga";
import billingSaga from "../modules/billing/billingSaga";
import notificationSaga from "../modules/notifications/notificationSaga";
import patientSaga from "../modules/patients/patientSaga";
import { all } from "redux-saga/effects";

export default function* rootSaga() {
  yield all([
    authSaga(),
    dashboardSaga(),
    appointmentSaga(),
    userSaga(),
    calendarSaga(),
    chatSaga(),
    tenantSaga(),
    prescriptionSaga(),
    billingSaga(),
    notificationSaga(),
    patientSaga(),
  ]);
}