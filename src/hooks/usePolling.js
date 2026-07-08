import { useEffect, useRef, useState } from 'react';

// Fetches immediately, then re-fetches every `intervalMs` in the
// background without resetting `loading` on subsequent polls — only
// the initial load shows a loading state, refreshes are silent.
export function usePolling(fetcher, intervalMs, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;
    let isFirstLoad = true;

    async function run() {
      if (isFirstLoad) setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await fetcherRef.current();
        if (!cancelled) setState({ data, loading: false, error: null });
      } catch (error) {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error }));
      }
      isFirstLoad = false;
    }

    run();
    const id = setInterval(run, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}