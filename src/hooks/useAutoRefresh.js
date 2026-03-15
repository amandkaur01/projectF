import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

/**
 * useAutoRefresh
 *
 * Calls fetchFn on:
 *  1. Every time this page is navigated to (React Router location change)
 *  2. Every intervalMs milliseconds (default 30s) as a background poll
 *
 * NOTE: window "focus" does NOT fire on in-app React Router navigation,
 * so we rely on useLocation() pathname changes instead.
 */
function useAutoRefresh(fetchFn, intervalMs = 30000) {
  const location = useLocation();
  const fetch = useCallback(fetchFn, []); // eslint-disable-line

  // Refetch every time the route pathname changes (i.e. you navigate to this page)
  useEffect(() => {
    fetch();
  }, [location.pathname, fetch]);

  // Background polling
  useEffect(() => {
    const timer = setInterval(fetch, intervalMs);
    return () => clearInterval(timer);
  }, [fetch, intervalMs]);
}

export default useAutoRefresh;