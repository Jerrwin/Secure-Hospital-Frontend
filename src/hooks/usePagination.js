import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

/**
 * Reusable hook for prefetch-ahead pagination.
 * 
 * @param {Object} options 
 * @param {Function} options.selector - Redux selector for the module's state
 * @param {Object} options.actions - Object containing fetchPaged, prefetch, setPage, moveBufferToList
 */
export const usePrefetchPagination = ({ selector, actions }) => {
  const dispatch = useDispatch();
  const state = useSelector(selector);
  
  const { 
    list, 
    buffer, 
    pagination, 
    loading, 
    fetched,
    error 
  } = state;

  const handlePageChange = useCallback((targetPage) => {
    const { currentPage } = pagination;
    
    // Instant Swap Logic: 
    // If going to the next page and we have it in buffer, swap it.
    // The saga will handle prefetching the next-next page.
    if (targetPage === currentPage + 1 && buffer && buffer.length > 0) {
      dispatch(actions.setPage(targetPage));
      // The saga watching for setPage will call moveBufferToList and prefetch next-next
    } else {
      // Normal fetch for target page
      dispatch(actions.fetchPaged(targetPage));
    }
  }, [dispatch, pagination, buffer, actions]);

  const refresh = useCallback(() => {
    dispatch(actions.fetchPaged(pagination.currentPage || 1));
  }, [dispatch, actions, pagination.currentPage]);

  return {
    list,
    pagination,
    loading,
    fetched,
    error,
    handlePageChange,
    refresh
  };
};

export default usePrefetchPagination;
