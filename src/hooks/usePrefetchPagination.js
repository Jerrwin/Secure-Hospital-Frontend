import { useCallback, useMemo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const PAGINATION_BTN_STYLE = {
  borderRadius: "8px",
  height: "36px",
  padding: "0 16px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontWeight: 600,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
};

const PAGE_BADGE_STYLE = {
  margin: "0 12px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  padding: "6px 16px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#475569",
  display: "flex",
  alignItems: "center",
  height: "36px",
  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
};

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

  // Track whether we've synced initialStatus (run only once on mount)
  const initialStatusSynced = useRef(false);

  // 1. One-time mount sync for initialStatus
  useEffect(() => {
    if (skip || initialStatusSynced.current) return;
    initialStatusSynced.current = true;

    if (
      initialStatus &&
      initialStatus !== "all" &&
      statusFilter !== initialStatus
    ) {
      console.log(`[usePrefetchPagination] Syncing initialStatus: ${initialStatus}`);
      dispatch(setStatus(initialStatus));
      // The statusFilter change will trigger the parameter-watch effect below
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Parameter-watch effect: fetch page 1 when filters change
  useEffect(() => {
    if (skip) return;
    console.log(
      `[usePrefetchPagination] Parameter changed, fetching page 1. Status: ${statusFilter}, Search: ${searchQuery}, Provider: ${providerId}`,
    );
    dispatch(fetchPagedRequest(1));
  }, [dispatch, fetchPagedRequest, statusFilter, searchQuery, providerId, skip]);

  // 3. Cache-watch effect: re-fetch current page when 'fetched' is invalidated (false)
  useEffect(() => {
    // If skip is on, or if we already have data (fetched is true), don't fetch.
    // We only fetch if fetched is explicitly false (invalidated) or initially false.
    if (skip || fetched) {
      return;
    }

    console.log(
      `[usePrefetchPagination] Cache invalidated or initial load. Fetching current page: ${pagination.currentPage}`,
      { statusFilter, searchQuery, fetched }
    );
    dispatch(fetchPagedRequest(pagination.currentPage));
  }, [dispatch, fetchPagedRequest, fetched, pagination.currentPage, skip, statusFilter, searchQuery]);

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

  // Memoize the itemRender function to avoid re-creating nodes unnecessarily
  const itemRender = useCallback(
    (page, type, originalElement) => {
      const total = pagination.total;
      const totalPages = Math.ceil(total / fixedPageSize) || 1;
      const currentPage = pagination.currentPage;

      // Ensure jump-next/jump-prev (ellipsis) are hidden for a cleaner symmetrical look
      if (type === "jump-prev" || type === "jump-next") {
        return null;
      }

      if (type === "prev") {
        return (
          <Button
            {...originalElement.props}
            icon={<LeftOutlined />}
            style={{
              ...PAGINATION_BTN_STYLE,
              color: currentPage <= 1 ? "#cbd5e1" : "#1e293b",
            }}
          >
            Previous
          </Button>
        );
      }

      if (type === "next") {
        return (
          <Button
            {...originalElement.props}
            icon={<RightOutlined />}
            iconPosition="end"
            style={{
              ...PAGINATION_BTN_STYLE,
              color: currentPage >= totalPages ? "#cbd5e1" : "#1e293b",
            }}
          >
            Next
          </Button>
        );
      }

      if (type === "page") {
        // Render a professional "Page X / Y" badge in the middle
        if (page !== currentPage) return null;
        return (
          <div style={PAGE_BADGE_STYLE}>
            Page {currentPage} / {totalPages}
          </div>
        );
      }

      return originalElement;
    },
    [pagination.currentPage, pagination.total, fixedPageSize],
  );

  // Ant Design Table compatible pagination object
  const tablePagination = useMemo(
    () => ({
      current: pagination.currentPage,
      pageSize: fixedPageSize, // Frontend enforced
      total: pagination.total,
      showSizeChanger: false,
      simple: false,
      position: ["bottomCenter"],
      hideOnSinglePage: false,
      itemRender,
      // Removed redundant onChange: setPageNum to avoid double-dispatches
      // handletableChange on the Table component is sufficient
    }),
    [pagination.currentPage, pagination.total, fixedPageSize, itemRender],
  );

  // Memoize actions to prevent infinite loops in useEffects that depend on them
  const stabilizedActions = useMemo(
    () => ({
      fetchPaged,
      setSearch: setSearchCallback,
      setStatus: setStatusCallback,
      handleTableChange: (pagination) => setPageNum(pagination.current),
    }),
    [fetchPaged, setSearchCallback, setStatusCallback, setPageNum],
  );

  return {
    list,
    buffer,
    pagination: tablePagination, // This is what the Table uses
    searchQuery,
    statusFilter,
    loading,
    actions: stabilizedActions,
  };
};
