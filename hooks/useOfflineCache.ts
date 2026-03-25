import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseOfflineCacheResult<T> {
  data: T | null;
  loading: boolean;
  isOffline: boolean;
  refetch: () => Promise<void>;
}

/**
 * Centralized offline cache hook.
 *
 * Tries to fetch fresh data from the API. If the request fails due to a
 * network error (no internet), it falls back to the last cached value.
 *
 * @param cacheKey  - Unique AsyncStorage key for this data (e.g. "cache:workouts")
 * @param fetchFn   - Async function that fetches fresh data and returns it
 */
export function useOfflineCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
): UseOfflineCacheResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // Avoid stale closures on re-renders
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  // Flag to skip the first NetInfo emission (it fires immediately on subscribe
  // with the current connectivity state, which would duplicate the initial load()
  // already triggered by the mount useEffect below).
  const isFirstNetInfoEmit = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const fresh = await fetchFnRef.current();
      setData(fresh);
      setIsOffline(false);
      // Persist fresh data for future offline use
      await AsyncStorage.setItem(cacheKey, JSON.stringify(fresh));
    } catch (error: any) {
      const isNetworkError =
        !error.response && (error.message === "Network Error" || error.code === "ECONNABORTED");

      if (isNetworkError) {
        // Try to load from cache
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          setData(JSON.parse(cached));
          setIsOffline(true);
        } else {
          // No cache available — surface the error normally
          setIsOffline(true);
        }
      } else {
        // Server error or auth error (e.g. 401 handled by axios interceptor)
        // Do not use cache — leave data as null so screen shows empty state
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [cacheKey]);

  useEffect(() => {
    load();
  }, [load]);

  // Proactive NetInfo subscription: detect connectivity changes immediately
  // instead of waiting for the fetch to fail.
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Skip the first emission: NetInfo fires synchronously on subscribe with
      // the current state. The initial load() is already handled by the mount
      // useEffect above — calling load() here too would cause a double request.
      if (isFirstNetInfoEmit.current) {
        isFirstNetInfoEmit.current = false;
        return;
      }

      if (state.isConnected === false) {
        // No internet — mark offline right away without waiting for a fetch error
        setIsOffline(true);
      } else if (state.isConnected === true) {
        // Reconnected — trigger a fresh fetch so data updates automatically
        setIsOffline(false);
        load();
      }
    });

    // Cleanup: remove the listener when the component unmounts to avoid memory leaks
    return () => unsubscribe();
  }, [load]);

  return { data, loading, isOffline, refetch: load };
}
