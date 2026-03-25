import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { 
  fetchPagedRequest, 
  prefetchRequest, 
  setPage, 
  setSearch, 
  setStatus,
  addStaffRequest, 
  updateStaffRequest, 
  deleteStaffRequest, 
  clearError 
} from '../userSlice';

const useUsers = () => {
  const dispatch = useDispatch();
  
  const state = useSelector(state => state.users);
  const { 
    list, 
    pagination, 
    loading, 
    error, 
    searchQuery, 
    statusFilter, 
    fetched,
    submitting 
  } = state || {};

  const fetchStaff = useCallback((page) => {
    dispatch(fetchPagedRequest(page));
  }, [dispatch]);

  const prefetchStaff = useCallback((page) => {
    dispatch(prefetchRequest(page));
  }, [dispatch]);

  const handleSetPage = useCallback((page) => {
    dispatch(setPage(page));
  }, [dispatch]);

  const handleSetSearch = useCallback((query) => {
    dispatch(setSearch(query));
  }, [dispatch]);

  const handleSetStatus = useCallback((status) => {
    dispatch(setStatus(status));
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
    list,
    pagination,
    loading,
    error,
    searchQuery,
    statusFilter,
    fetched,
    submitting,
    fetchStaff,
    prefetchStaff,
    setPage: handleSetPage,
    setSearch: handleSetSearch,
    setStatus: handleSetStatus,
    addStaff,
    updateStaff,
    removeStaff,
    clearUserError
  }), [
    list, pagination, loading, error, searchQuery, statusFilter, fetched, submitting,
    fetchStaff, prefetchStaff, handleSetPage, handleSetSearch, handleSetStatus,
    addStaff, updateStaff, removeStaff, clearUserError
  ]);
};

export default useUsers;
