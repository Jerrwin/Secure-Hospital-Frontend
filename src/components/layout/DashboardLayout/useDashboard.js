import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { fetchDashboardDataRequest } from "../../../modules/dashboard/dashboardSlice";
import { useEffect, useMemo } from "react";

const useDashboard = (userRole) => {
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
    if (userRole && !fetched && !loading) {
      dispatch(fetchDashboardDataRequest({ role: userRole }));
    }
  }, [dispatch, userRole, fetched, loading]);

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
