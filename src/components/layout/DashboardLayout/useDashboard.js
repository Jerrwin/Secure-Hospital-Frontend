import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { fetchDashboardDataRequest } from "../../../modules/dashboard/dashboardSlice";
import { useEffect, useMemo } from "react";

const useDashboard = (user) => {
  const dispatch = useDispatch();

  // Extract state surgicallly using shallowEqual
  // This ensures the component only re-renders if the values INSIDE actually change
  const {
    stats,
    appointments,
    patients,
    prescriptions,
    staff,
    loading,
    error,
  } = useSelector((state) => state.dashboard, shallowEqual);

  // Dispatch the fetch request on mount, passing the user's role
  useEffect(() => {
    if (user?.role) {
      dispatch(fetchDashboardDataRequest({ role: user.role }));
    }
  }, [dispatch, user?.role]);

  // Memoize the return object so child components don't unnecessarily re-render
  const dashboardData = useMemo(
    () => ({
      stats,
      appointments,
      patients,
      prescriptions,
      staff,
      loading,
      error,
    }),
    [stats, appointments, patients, prescriptions, staff, loading, error],
  );

  return dashboardData;
};

export default useDashboard;
