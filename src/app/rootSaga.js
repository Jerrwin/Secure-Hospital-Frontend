import authSaga from "../modules/auth/authSaga";
import dashboardSaga from "../modules/dashboard/dashboardSaga";
import appointmentSaga from "../modules/appointments/appointmentSaga";
import userSaga from "../modules/users/userSaga";
import calendarSaga from "../modules/calendar/calendarSaga";
import chatSaga from "../modules/chat/chatSaga";
import { all } from "redux-saga/effects";

export default function* rootSaga() {
  yield all([
    authSaga(),
    dashboardSaga(),
    appointmentSaga(),
    userSaga(),
    calendarSaga(),
    chatSaga(),
  ]);
}