import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPagedRequest,
  setPage,
  setSearch as setSearchAction,
  setStatus as setStatusAction,
  setProviderId as setProviderIdAction,
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
    buffer,
    pagination,
    searchQuery,
    statusFilter,
    upcoming,
    selected,
    patients,
    staff,
    loading,
    prefetching,
    dropdownLoading,
    submitting,
    fetched,
    error,
    submitError,
  } = useSelector((state) => state.appointments);

  // ── Actions memoized with useCallback ────────────────────────────────────
  const fetchPaged = useCallback((page) => dispatch(fetchPagedRequest(page)), [dispatch]);
  const setPageNum = useCallback((page) => dispatch(setPage(page)), [dispatch]);
  const setSearch = useCallback((q) => dispatch(setSearchAction(q)), [dispatch]);
  const setStatus = useCallback((s) => dispatch(setStatusAction(s)), [dispatch]);
  const setProviderId = useCallback((id) => dispatch(setProviderIdAction(id)), [dispatch]);

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
    buffer,
    pagination,
    searchQuery,
    statusFilter,
    upcoming,
    selected,
    patients,
    staff,
    loading,
    prefetching,
    dropdownLoading,
    submitting,
    fetched,
    error,
    submitError,
    
    // Actions
    fetchPaged,
    setPageNum,
    setSearch,
    setStatus,
    setProviderId,
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
