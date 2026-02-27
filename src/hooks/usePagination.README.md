# usePagination Hook

A custom React hook for managing pagination state with URL synchronization support.

## Features

- ✅ Manages page and perPage state
- ✅ Synchronizes pagination state with URL parameters
- ✅ Preserves existing URL parameters
- ✅ Resets to page 1 when perPage changes
- ✅ Provides reset functionality
- ✅ TypeScript support

## Requirements

**Validates Requirements:**
- 13.2: Permettre de changer de page via les contrôles de pagination
- 13.4: Permettre de changer le nombre d'éléments par page
- 13.5: Envoyer une requête à l'Admin_API avec les paramètres de pagination
- 13.6: Maintenir les paramètres de pagination dans l'URL pour permettre le partage de liens
- 13.7: Créer un hook usePagination pour gérer la logique de pagination

## Usage

### Basic Usage

```typescript
import { usePagination } from '@/hooks/usePagination';

function MyComponent() {
  const { page, perPage, setPage, setPerPage, reset } = usePagination();

  // Use page and perPage in your API calls
  useEffect(() => {
    fetchData(page, perPage);
  }, [page, perPage]);

  return (
    <div>
      <button onClick={() => setPage(page - 1)} disabled={page === 1}>
        Previous
      </button>
      <span>Page {page}</span>
      <button onClick={() => setPage(page + 1)}>
        Next
      </button>
      
      <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
        <option value={10}>10 per page</option>
        <option value={25}>25 per page</option>
        <option value={50}>50 per page</option>
      </select>
    </div>
  );
}
```

### With Custom Defaults

```typescript
const { page, perPage, setPage, setPerPage } = usePagination({
  defaultPage: 1,
  defaultPerPage: 25,
  syncWithUrl: true, // default is true
});
```

### Without URL Synchronization

```typescript
const { page, perPage, setPage, setPerPage } = usePagination({
  syncWithUrl: false, // Disable URL sync
});
```

### With API Integration

```typescript
import { usePagination } from '@/hooks/usePagination';
import { musicService } from '@/services/music.service';

function MusicList() {
  const { page, perPage, setPage, setPerPage } = usePagination();
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMusics = async () => {
      setLoading(true);
      try {
        const response = await musicService.list(page, perPage);
        setMusics(response.data);
      } catch (error) {
        console.error('Failed to fetch musics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMusics();
  }, [page, perPage]);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {musics.map((music) => (
            <li key={music.id}>{music.title}</li>
          ))}
        </ul>
      )}
      
      <Pagination
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />
    </div>
  );
}
```

## API

### Options

```typescript
interface UsePaginationOptions {
  defaultPage?: number;      // Default: 1
  defaultPerPage?: number;   // Default: 10
  syncWithUrl?: boolean;     // Default: true
}
```

### Return Value

```typescript
{
  page: number;              // Current page number
  perPage: number;           // Items per page
  setPage: (page: number) => void;        // Update page
  setPerPage: (perPage: number) => void;  // Update perPage (resets to page 1)
  reset: () => void;         // Reset to default values
}
```

## Behavior

### URL Synchronization

When `syncWithUrl` is `true` (default):
- Pagination state is initialized from URL parameters (`?page=2&perPage=25`)
- Changes to pagination state update the URL
- Existing URL parameters are preserved
- URL changes are reflected in the state

### Page Reset on perPage Change

When `setPerPage` is called, the page is automatically reset to 1. This prevents showing an invalid page (e.g., page 10 when only 3 pages exist with the new perPage value).

### URL Parameter Preservation

The hook preserves other URL parameters when updating pagination:

```
Before: /music?search=rock&filter=approved&page=1&perPage=10
After setPage(2): /music?search=rock&filter=approved&page=2&perPage=10
```

## Examples

### Complete Pagination Component

```typescript
import { usePagination } from '@/hooks/usePagination';

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

function DataTable({ meta }: { meta: PaginationMeta }) {
  const { page, perPage, setPage, setPerPage } = usePagination({
    defaultPage: meta.current_page,
    defaultPerPage: meta.per_page,
  });

  return (
    <div>
      {/* Data display */}
      
      {/* Pagination controls */}
      <div className="pagination">
        <button
          onClick={() => setPage(1)}
          disabled={page === 1}
        >
          First
        </button>
        
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        
        <span>
          Page {page} of {meta.last_page}
        </span>
        
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === meta.last_page}
        >
          Next
        </button>
        
        <button
          onClick={() => setPage(meta.last_page)}
          disabled={page === meta.last_page}
        >
          Last
        </button>
        
        <select
          value={perPage}
          onChange={(e) => setPerPage(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        
        <span>
          Showing {(page - 1) * perPage + 1} to{' '}
          {Math.min(page * perPage, meta.total)} of {meta.total} items
        </span>
      </div>
    </div>
  );
}
```

## Notes

- The hook uses Next.js navigation hooks (`useRouter`, `useSearchParams`, `usePathname`)
- URL updates use `router.push` with `scroll: false` to prevent page scrolling
- Invalid URL parameters (non-numeric values) fall back to default values
- The hook is designed to work with Laravel API pagination format

## Related

- [useFileUpload](./useFileUpload.README.md) - File upload hook
- [Pagination Component](../components/common/Pagination.tsx) - Reusable pagination UI component
