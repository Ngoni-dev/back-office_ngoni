import { act, renderHook } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { usePagination } from '../usePagination';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

describe('usePagination', () => {
  const mockPush = jest.fn();
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('page');
    mockSearchParams.delete('perPage');

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (usePathname as jest.Mock).mockReturnValue('/test-path');
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => usePagination());

      expect(result.current.page).toBe(1);
      expect(result.current.perPage).toBe(10);
    });

    it('should initialize with custom default values', () => {
      const { result } = renderHook(() =>
        usePagination({ defaultPage: 2, defaultPerPage: 20 })
      );

      expect(result.current.page).toBe(2);
      expect(result.current.perPage).toBe(20);
    });

    it('should initialize from URL params when syncWithUrl is true', () => {
      mockSearchParams.set('page', '3');
      mockSearchParams.set('perPage', '25');

      const { result } = renderHook(() => usePagination({ syncWithUrl: true }));

      expect(result.current.page).toBe(3);
      expect(result.current.perPage).toBe(25);
    });

    it('should not initialize from URL params when syncWithUrl is false', () => {
      mockSearchParams.set('page', '3');
      mockSearchParams.set('perPage', '25');

      const { result } = renderHook(() => usePagination({ syncWithUrl: false }));

      expect(result.current.page).toBe(1);
      expect(result.current.perPage).toBe(10);
    });
  });

  describe('setPage', () => {
    it('should update page state', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.setPage(5);
      });

      expect(result.current.page).toBe(5);
    });

    it('should update URL when syncWithUrl is true', () => {
      const { result } = renderHook(() => usePagination({ syncWithUrl: true }));

      act(() => {
        result.current.setPage(3);
      });

      expect(mockPush).toHaveBeenCalledWith('/test-path?page=3&perPage=10', {
        scroll: false,
      });
    });

    it('should not update URL when syncWithUrl is false', () => {
      const { result } = renderHook(() => usePagination({ syncWithUrl: false }));

      act(() => {
        result.current.setPage(3);
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should preserve existing URL params', () => {
      mockSearchParams.set('search', 'test');
      mockSearchParams.set('filter', 'active');

      const { result } = renderHook(() => usePagination({ syncWithUrl: true }));

      act(() => {
        result.current.setPage(2);
      });

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('search=test'),
        expect.any(Object)
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('filter=active'),
        expect.any(Object)
      );
    });
  });

  describe('setPerPage', () => {
    it('should update perPage state and reset page to 1', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.setPage(5);
      });

      act(() => {
        result.current.setPerPage(20);
      });

      expect(result.current.perPage).toBe(20);
      expect(result.current.page).toBe(1);
    });

    it('should update URL with new perPage and page=1', () => {
      const { result } = renderHook(() => usePagination({ syncWithUrl: true }));

      act(() => {
        result.current.setPerPage(25);
      });

      expect(mockPush).toHaveBeenCalledWith('/test-path?page=1&perPage=25', {
        scroll: false,
      });
    });

    it('should not update URL when syncWithUrl is false', () => {
      const { result } = renderHook(() => usePagination({ syncWithUrl: false }));

      act(() => {
        result.current.setPerPage(25);
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should reset to default values', () => {
      const { result } = renderHook(() =>
        usePagination({ defaultPage: 1, defaultPerPage: 10 })
      );

      act(() => {
        result.current.setPage(5);
        result.current.setPerPage(50);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.page).toBe(1);
      expect(result.current.perPage).toBe(10);
    });

    it('should reset to custom default values', () => {
      const { result } = renderHook(() =>
        usePagination({ defaultPage: 2, defaultPerPage: 20 })
      );

      act(() => {
        result.current.setPage(5);
        result.current.setPerPage(50);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.page).toBe(2);
      expect(result.current.perPage).toBe(20);
    });

    it('should update URL when reset', () => {
      const { result } = renderHook(() =>
        usePagination({ defaultPage: 1, defaultPerPage: 10, syncWithUrl: true })
      );

      act(() => {
        result.current.setPage(5);
      });

      act(() => {
        result.current.reset();
      });

      expect(mockPush).toHaveBeenLastCalledWith('/test-path?page=1&perPage=10', {
        scroll: false,
      });
    });
  });

  describe('URL synchronization', () => {
    it('should handle invalid page parameter in URL', () => {
      mockSearchParams.set('page', 'invalid');
      mockSearchParams.set('perPage', '10');

      const { result } = renderHook(() => usePagination({ syncWithUrl: true }));

      // Should fall back to default when parsing fails
      expect(result.current.page).toBe(1);
    });

    it('should handle invalid perPage parameter in URL', () => {
      mockSearchParams.set('page', '1');
      mockSearchParams.set('perPage', 'invalid');

      const { result } = renderHook(() => usePagination({ syncWithUrl: true }));

      // Should fall back to default when parsing fails
      expect(result.current.perPage).toBe(10);
    });

    it('should handle missing URL parameters', () => {
      const { result } = renderHook(() => usePagination({ syncWithUrl: true }));

      expect(result.current.page).toBe(1);
      expect(result.current.perPage).toBe(10);
    });
  });

  describe('Edge cases', () => {
    it('should handle page 0', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.setPage(0);
      });

      expect(result.current.page).toBe(0);
    });

    it('should handle negative page numbers', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.setPage(-1);
      });

      expect(result.current.page).toBe(-1);
    });

    it('should handle very large page numbers', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.setPage(999999);
      });

      expect(result.current.page).toBe(999999);
    });

    it('should handle perPage of 1', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.setPerPage(1);
      });

      expect(result.current.perPage).toBe(1);
    });

    it('should handle very large perPage values', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.setPerPage(1000);
      });

      expect(result.current.perPage).toBe(1000);
    });
  });
});
