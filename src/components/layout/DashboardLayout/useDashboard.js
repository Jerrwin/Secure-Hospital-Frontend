import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { fetchDashboardDataRequest } from "../../../modules/dashboard/dashboardSlice";
import { useEffect, useMemo } from "react";

const useDashboard = (user) => {
  const dispatch = useDispatch();

  const {
    stats,
    appointments,
    patients,
    prescriptions,
    staff,
    weekly_trend,
    loading,
    fetched,
    error,
  } = useSelector((state) => state.dashboard, shallowEqual);

  useEffect(() => {
    if (user?.role && !fetched && !loading) {
      dispatch(fetchDashboardDataRequest({ role: user.role }));
    }
  }, [dispatch, user?.role, fetched, loading]);

  const dashboardData = useMemo(
    () => ({
      stats,
      appointments,
      patients,
      prescriptions,
      staff,
      weekly_trend,
      loading,
      error,
    }),
    [stats, appointments, patients, prescriptions, staff, weekly_trend, loading, error],
  );

  return dashboardData;
};

export default useDashboard;
