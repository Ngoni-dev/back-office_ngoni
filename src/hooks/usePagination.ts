import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface PaginationState {
  page: number;
  perPage: number;
}

interface UsePaginationOptions {
  defaultPage?: number;
  defaultPerPage?: number;
  syncWithUrl?: boolean;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const {
    defaultPage = 1,
    defaultPerPage = 10,
    syncWithUrl = true,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL params if syncWithUrl is enabled
  const getInitialPage = useCallback(() => {
    if (syncWithUrl) {
      const pageParam = searchParams.get('page');
      return pageParam ? parseInt(pageParam, 10) : defaultPage;
    }
    return defaultPage;
  }, [syncWithUrl, searchParams, defaultPage]);

  const getInitialPerPage = useCallback(() => {
    if (syncWithUrl) {
      const perPageParam = searchParams.get('perPage');
      return perPageParam ? parseInt(perPageParam, 10) : defaultPerPage;
    }
    return defaultPerPage;
  }, [syncWithUrl, searchParams, defaultPerPage]);

  const [page, setPageState] = useState<number>(getInitialPage);
  const [perPage, setPerPageState] = useState<number>(getInitialPerPage);

  // Update URL when pagination state changes
  const updateUrl = useCallback(
    (newPage: number, newPerPage: number) => {
      if (!syncWithUrl) return;

      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      params.set('perPage', newPerPage.toString());

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [syncWithUrl, searchParams, pathname, router]
  );

  // Set page and update URL
  const setPage = useCallback(
    (newPage: number) => {
      setPageState(newPage);
      updateUrl(newPage, perPage);
    },
    [perPage, updateUrl]
  );

  // Set perPage and reset to page 1
  const setPerPage = useCallback(
    (newPerPage: number) => {
      setPerPageState(newPerPage);
      setPageState(1);
      updateUrl(1, newPerPage);
    },
    [updateUrl]
  );

  // Reset pagination to defaults
  const reset = useCallback(() => {
    setPageState(defaultPage);
    setPerPageState(defaultPerPage);
    updateUrl(defaultPage, defaultPerPage);
  }, [defaultPage, defaultPerPage, updateUrl]);

  // Sync state with URL params when they change externally
  useEffect(() => {
    if (!syncWithUrl) return;

    const pageParam = searchParams.get('page');
    const perPageParam = searchParams.get('perPage');

    const urlPage = pageParam ? parseInt(pageParam, 10) : defaultPage;
    const urlPerPage = perPageParam ? parseInt(perPageParam, 10) : defaultPerPage;

    if (urlPage !== page) {
      setPageState(urlPage);
    }

    if (urlPerPage !== perPage) {
      setPerPageState(urlPerPage);
    }
  }, [searchParams, syncWithUrl, defaultPage, defaultPerPage]);

  return {
    page,
    perPage,
    setPage,
    setPerPage,
    reset,
  };
}
