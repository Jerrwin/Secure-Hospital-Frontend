import authSaga from "../modules/auth/authSaga";
import dashboardSaga from "../modules/dashboard/dashboardSaga";
import userSaga from "../modules/users/userSaga";
import { all } from "redux-saga/effects";

export default function* rootSaga() {
  yield all([
    authSaga(),
    dashboardSaga(),
    userSaga(),
  ]);
}