import { useState, useEffect, useRef, useCallback } from 'react';

// Global cache for data
const globalCache: Record<string, {
  data: any;
  timestamp: number;
  promise?: Promise<any>;
}> = {};

// Default cache TTL is 5 minutes
const DEFAULT_TTL = 5 * 60 * 1000;

export function useCachedFetch<T>(url: string, options?: RequestInit, ttl: number = DEFAULT_TTL) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use a ref for the cache key to avoid re-renders
  const cacheKey = useRef(`${url}:${JSON.stringify(options?.body || {})}`);
  
  // Memoize the fetchData function to ensure it remains consistent
  const fetchData = useCallback(async () => {
    try {
      // Check if we have a cached response that's not expired
      const cachedResponse = globalCache[cacheKey.current];
      const now = Date.now();
      
      if (cachedResponse) {
        // If we have a cached promise, reuse it
        if (cachedResponse.promise) {
          try {
            const result = await cachedResponse.promise;
            setData(result);
            return result;
          } catch (err) {
            // If the cached promise rejects, we'll want to try again
            delete globalCache[cacheKey.current];
            throw err;
          }
        }
        
        // If cached data is still valid
        if (now - cachedResponse.timestamp < ttl) {
          setData(cachedResponse.data);
          setLoading(false);
          return cachedResponse.data;
        }
      }
      
      // Cache miss or expired cache, make a new request
      setLoading(true);
      
      // Create a new promise for this request and cache it
      const fetchPromise = fetch(url, options).then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      });
      
      // Store the promise in the cache
      globalCache[cacheKey.current] = {
        data: null,
        timestamp: now,
        promise: fetchPromise
      };
      
      // Wait for the request to complete
      const result = await fetchPromise;
      
      // Update the cache with the actual data
      globalCache[cacheKey.current] = {
        data: result,
        timestamp: now
      };
      
      setData(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
      throw err;
    }
  }, [url, options, ttl]);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        await fetchData();
      } catch (err) {
        // Error is already set in fetchData
        console.error('Error fetching data:', err);
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [fetchData]);
  
  // Function to force refresh the data
  const refresh = useCallback(async () => {
    // Clear the cache entry
    delete globalCache[cacheKey.current];
    return fetchData();
  }, [fetchData]);
  
  return { data, loading, error, refresh };
}

// Function to manually clear specific cache entries
export function clearCache(urlPattern: string | RegExp) {
  if (typeof urlPattern === 'string') {
    // Clear exact match
    Object.keys(globalCache).forEach(key => {
      if (key.startsWith(urlPattern)) {
        delete globalCache[key];
      }
    });
  } else {
    // Clear by regex pattern
    Object.keys(globalCache).forEach(key => {
      if (urlPattern.test(key)) {
        delete globalCache[key];
      }
    });
  }
}

// Function to clear the entire cache
export function clearAllCache() {
  Object.keys(globalCache).forEach(key => {
    delete globalCache[key];
  });
}