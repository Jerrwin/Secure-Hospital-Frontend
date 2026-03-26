import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRequest,
  fetchPagedRequest,
  setPage,
  setSearch as setSearchAction,
  setStatus as setStatusAction,
  createRequest,
  updateRequest,
  statusChangeRequest,
  deleteRequest,
  clearError as clearPrescriptionErrorAction,
} from "../prescriptionSlice";

const usePrescription = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.prescription);

  const fetchPrescriptions = useCallback(() => {
    dispatch(fetchRequest());
  }, [dispatch]);

  const fetchPaged = useCallback((page) => {
    dispatch(fetchPagedRequest(page));
  }, [dispatch]);

  const setPageNum = useCallback((page) => {
    dispatch(setPage(page));
  }, [dispatch]);

  const setSearch = useCallback((q) => {
    dispatch(setSearchAction(q));
  }, [dispatch]);

  const setStatus = useCallback((s) => {
    dispatch(setStatusAction(s));
  }, [dispatch]);

  const createPrescription = useCallback((data) => {
    dispatch(createRequest(data));
  }, [dispatch]);

  const updatePrescription = useCallback((id, data) => {
    dispatch(updateRequest({ id, data }));
  }, [dispatch]);

  const changeStatus = useCallback((id, type) => {
    dispatch(statusChangeRequest({ id, type }));
  }, [dispatch]);

  const deletePrescription = useCallback((id) => {
    dispatch(deleteRequest(id));
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearPrescriptionErrorAction());
  }, [dispatch]);

  return {
    ...state,
    fetchPrescriptions,
    fetchPaged,
    setPageNum,
    setSearch,
    setStatus,
    createPrescription,
    updatePrescription,
    changeStatus,
    deletePrescription,
    clearError,
  };
};

export default usePrescription;
