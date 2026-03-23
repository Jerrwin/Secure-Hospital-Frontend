import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRequest,
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
    createPrescription,
    updatePrescription,
    changeStatus,
    deletePrescription,
    clearError,
  };
};

export default usePrescription;
