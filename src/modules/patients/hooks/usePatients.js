import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  fetchPatientsRequest, 
  fetchPatientByIdRequest, 
  createPatientRequest, 
  updatePatientRequest, 
  deletePatientRequest, 
  clearPatientError,
  setSelectedPatient
} from '../patientSlice';

const usePatients = () => {
  const dispatch = useDispatch();
  
  const patients = useSelector(state => state.patients?.patients || []);
  const selectedPatient = useSelector(state => state.patients?.selectedPatient || null);
  const loading = useSelector(state => state.patients?.loading || false);
  const isLoaded = useSelector(state => state.patients?.isLoaded || false);
  const error = useSelector(state => state.patients?.error || null);

  const fetchPatients = useCallback((force = false) => {
    if (force || !isLoaded) {
      dispatch(fetchPatientsRequest());
    }
  }, [dispatch, isLoaded]);

  const fetchPatientById = useCallback((id) => {
    dispatch(fetchPatientByIdRequest(id));
  }, [dispatch]);

  const addPatient = useCallback((data) => {
    dispatch(createPatientRequest(data));
  }, [dispatch]);

  const updatePatient = useCallback((id, data) => {
    dispatch(updatePatientRequest({ id, data }));
  }, [dispatch]);

  const removePatient = useCallback((id) => {
    dispatch(deletePatientRequest(id));
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearPatientError());
  }, [dispatch]);

  const selectPatient = useCallback((patient) => {
    dispatch(setSelectedPatient(patient));
  }, [dispatch]);

  return useMemo(() => ({
    patients,
    selectedPatient,
    loading,
    error,
    isLoaded,
    fetchPatients,
    fetchPatientById,
    addPatient,
    updatePatient,
    removePatient,
    clearError,
    selectPatient
  }), [patients, selectedPatient, loading, error, isLoaded, fetchPatients, fetchPatientById, addPatient, updatePatient, removePatient, clearError, selectPatient]);
};

export default usePatients;
