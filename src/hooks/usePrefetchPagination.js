import { useCallback, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

/**
 * Generic hook for prefetch-ahead pagination.
 *
 * @param {Object} options
 * @param {Function} options.selector - Redux selector for the module state
 * @param {Object} options.actions - Action creators (fetchPaged, setPage, setSearch, setStatus)
 * @param {Number} options.fixedPageSize - The page size to enforce
 */
export const usePrefetchPagination = ({
  selector,
  actions,
  fixedPageSize = 5,
  initialStatus = "all",
  skip = false,
}) => {
  const dispatch = useDispatch();
  const state = useSelector(selector);

  const { list, buffer, pagination, searchQuery, statusFilter, providerId, fetched, loading } =
    state;

  const { fetchPagedRequest, setPage: setPageAction, setSearch, setStatus } = actions;

  // Sync initial status if provided and different from current state
  useEffect(() => {
    if (initialStatus && initialStatus !== "all" && statusFilter !== initialStatus) {
      console.log(`[usePrefetchPagination] Syncing initialStatus: ${initialStatus}`);
      dispatch(setStatus(initialStatus));
    }
    // Only run this once on mount/initialStatus change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStatus]);

  // Initial Fetch if not already fetched
  useEffect(() => {
    const isAlreadyFetched = fetched || state.isLoaded;
    if (!isAlreadyFetched && !loading && !skip) {
      console.log(`[usePrefetchPagination] Triggering fetchPagedRequest(1). Status: ${statusFilter}, Search: ${searchQuery}`);
      dispatch(fetchPagedRequest(1));
    }
  }, [dispatch, fetched, loading, state.isLoaded, fetchPagedRequest, statusFilter, searchQuery, providerId, skip]);

  const fetchPaged = useCallback(
    (page) => {
      dispatch(fetchPagedRequest(page));
    },
    [dispatch, fetchPagedRequest],
  );

  const setPageNum = useCallback(
    (page) => {
      dispatch(setPageAction(page));
    },
    [dispatch, setPageAction],
  );

  const setSearchCallback = useCallback(
    (query) => {
      dispatch(setSearch(query));
    },
    [dispatch, setSearch],
  );

  const setStatusCallback = useCallback(
    (status) => {
      dispatch(setStatus(status));
    },
    [dispatch, setStatus],
  );

  // Ant Design Table compatible pagination object
  const tablePagination = useMemo(
    () => ({
      current: pagination.currentPage,
      pageSize: fixedPageSize, // Frontend enforced
      total: pagination.total,
      showSizeChanger: false,
      position: ["bottomCenter"],
      hideOnSinglePage: false,
    }),
    [pagination.currentPage, pagination.total, fixedPageSize],
  );

  const handleTableChange = useCallback(
    (pag) => {
      setPageNum(pag.current);
    },
    [setPageNum],
  );

  const memoizedActions = useMemo(
    () => ({
      fetchPaged,
      setPage: setPageNum,
      setSearch: setSearchCallback,
      setStatus: setStatusCallback,
      handleTableChange,
    }),
    [
      fetchPaged,
      setPageNum,
      setSearchCallback,
      setStatusCallback,
      handleTableChange,
    ],
  );

  return {
    data: list,
    buffer,
    pagination: tablePagination,
    loading,
    searchQuery,
    statusFilter,
    providerId,
    actions: memoizedActions,
  };
};
