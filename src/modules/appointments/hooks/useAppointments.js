import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAppointmentsRequest,
  fetchUpcomingRequest,
  fetchAppointmentByIdRequest,
  createAppointmentRequest,
  updateAppointmentRequest,
  cancelAppointmentRequest,
  completeAppointmentRequest,
  fetchDropdownDataRequest,
  clearSubmitError,
} from "../appointmentSlice";

// ─── useAppointments hook ──────────────────────────────────────────────────────
const useAppointments = () => {
  const dispatch = useDispatch();

  const {
    list,
    upcoming,
    selected,
    patients,
    staff,
    loading,
    dropdownLoading,
    submitting,
    fetched,
    error,
    submitError,
  } = useSelector((state) => state.appointments);

  // ── Actions memoized with useCallback ────────────────────────────────────
  const fetchAll = useCallback((filters) => dispatch(fetchAppointmentsRequest(filters)), [dispatch]);
  const fetchUpcoming = useCallback(() => dispatch(fetchUpcomingRequest()), [dispatch]);
  const fetchById = useCallback((id) => dispatch(fetchAppointmentByIdRequest(id)), [dispatch]);
  const create = useCallback((data) => dispatch(createAppointmentRequest(data)), [dispatch]);
  const update = useCallback((id, data) => dispatch(updateAppointmentRequest({ id, data })), [dispatch]);
  const cancel = useCallback((id) => dispatch(cancelAppointmentRequest(id)), [dispatch]);
  const complete = useCallback((id) => dispatch(completeAppointmentRequest(id)), [dispatch]);
  const fetchDropdowns = useCallback(() => dispatch(fetchDropdownDataRequest()), [dispatch]);
  const clearError = useCallback(() => dispatch(clearSubmitError()), [dispatch]);

  return {
    // State
    list,
    upcoming,
    selected,
    patients,
    staff,
    loading,
    dropdownLoading,
    submitting,
    fetched,
    error,
    submitError,

    // Actions
    fetchAll,
    fetchUpcoming,
    fetchById,
    create,
    update,
    cancel,
    complete,
    fetchDropdowns,
    clearError,
  };
};

export default useAppointments;
