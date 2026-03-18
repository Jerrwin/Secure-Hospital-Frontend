import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { fetchStaffRequest, addStaffRequest, updateStaffRequest, deleteStaffRequest, clearError } from '../userSlice';

const useUsers = () => {
  const dispatch = useDispatch();
  
  const staffList = useSelector(state => state.users?.staffList || []);
  const loading = useSelector(state => state.users?.loading || false);
  const error = useSelector(state => state.users?.error || null);

  const fetchStaff = useCallback(() => {
    dispatch(fetchStaffRequest());
  }, [dispatch]);

  const addStaff = useCallback((data) => {
    dispatch(addStaffRequest(data));
  }, [dispatch]);

  const updateStaff = useCallback((id, data) => {
    dispatch(updateStaffRequest({ id, data }));
  }, [dispatch]);

  const removeStaff = useCallback((id) => {
    dispatch(deleteStaffRequest(id));
  }, [dispatch]);

  const clearUserError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return useMemo(() => ({
    staffList,
    loading,
    error,
    fetchStaff,
    addStaff,
    updateStaff,
    removeStaff,
    clearUserError
  }), [staffList, loading, error, fetchStaff, addStaff, updateStaff, removeStaff, clearUserError]);
};

export default useUsers;
