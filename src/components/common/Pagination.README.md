# Pagination Component

A reusable pagination component built with Material-UI that integrates seamlessly with the `usePagination` hook.

## Features

- ✅ Material-UI styled pagination controls
- ✅ Configurable items per page selector
- ✅ Display information about current items shown
- ✅ First/Last page navigation buttons
- ✅ Responsive layout with flexbox
- ✅ TypeScript support
- ✅ Customizable per page options
- ✅ Optional info text and per page selector

## Requirements

**Validates Requirements:**
- 13.1: Afficher les contrôles de pagination pour toutes les listes paginées
- 13.2: Permettre de changer de page via les contrôles de pagination
- 13.3: Afficher le nombre total d'éléments et le nombre de pages
- 13.4: Permettre de changer le nombre d'éléments par page
- 10.1: Réutiliser les composants de cards du template pour afficher les données
- 10.2: Réutiliser les composants de tables du template pour les listes paginées
- 10.3: Réutiliser les composants de forms du template pour les formulaires de création/édition

## Usage

### Basic Usage with usePagination Hook

```typescript
import { usePagination } from '@/hooks/usePagination'
import Pagination from '@/components/common/Pagination'

function MusicList() {
  const { page, perPage, setPage, setPerPage } = usePagination()
  const [musics, setMusics] = useState([])
  const [meta, setMeta] = useState(null)

  useEffect(() => {
    const fetchMusics = async () => {
      const response = await musicService.list(page, perPage)
      setMusics(response.data)
      setMeta(response.meta)
    }
    fetchMusics()
  }, [page, perPage])

  return (
    <div>
      {/* Your data display */}
      <ul>
        {musics.map(music => (
          <li key={music.id}>{music.title}</li>
        ))}
      </ul>

      {/* Pagination */}
      <Pagination
        page={page}
        perPage={perPage}
        meta={meta}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />
    </div>
  )
}
```

### With Custom Per Page Options

```typescript
<Pagination
  page={page}
  perPage={perPage}
  meta={meta}
  onPageChange={setPage}
  onPerPageChange={setPerPage}
  perPageOptions={[5, 10, 20, 50]}
/>
```

### Without Per Page Selector

```typescript
<Pagination
  page={page}
  perPage={perPage}
  meta={meta}
  onPageChange={setPage}
  onPerPageChange={setPerPage}
  showPerPageSelector={false}
/>
```

### Without Info Text

```typescript
<Pagination
  page={page}
  perPage={perPage}
  meta={meta}
  onPageChange={setPage}
  onPerPageChange={setPerPage}
  showInfo={false}
/>
```

### Minimal Configuration (Without Meta)

```typescript
// When you don't have meta from API, component will calculate based on page/perPage
<Pagination
  page={page}
  perPage={perPage}
  onPageChange={setPage}
  onPerPageChange={setPerPage}
/>
```

## API

### Props

```typescript
interface PaginationMeta {
  current_page: number    // Current page from API
  last_page: number       // Total number of pages
  per_page: number        // Items per page
  total: number           // Total number of items
}

interface PaginationProps {
  page: number                              // Current page (required)
  perPage: number                           // Items per page (required)
  meta?: PaginationMeta                     // Pagination metadata from API (optional)
  onPageChange: (page: number) => void      // Page change handler (required)
  onPerPageChange: (perPage: number) => void // Per page change handler (required)
  perPageOptions?: number[]                 // Available per page options (default: [10, 25, 50, 100])
  showPerPageSelector?: boolean             // Show per page selector (default: true)
  showInfo?: boolean                        // Show info text (default: true)
}
```

### PaginationMeta

The `meta` prop should match the Laravel API pagination response format:

```json
{
  "data": [...],
  "meta": {
    "current_page": 2,
    "last_page": 10,
    "per_page": 25,
    "total": 250
  }
}
```

## Behavior

### Page Change

When the user clicks on a page number or navigation button:
1. The `onPageChange` callback is called with the new page number
2. The parent component should fetch new data with the updated page
3. The URL is automatically updated if using `usePagination` with `syncWithUrl: true`

### Per Page Change

When the user changes the items per page:
1. The `onPerPageChange` callback is called with the new per page value
2. The page is automatically reset to 1 (handled by `usePagination`)
3. The parent component should fetch new data with the updated per page value
4. The URL is automatically updated if using `usePagination` with `syncWithUrl: true`

### Disabled State

The pagination controls are automatically disabled when:
- Total pages is 1 or less
- No items to display

### Info Text

The info text displays:
- "Aucun élément" when there are no items
- "Affichage de X à Y sur Z éléments" when there are items

Example: "Affichage de 26 à 50 sur 250 éléments"

## Styling

The component uses Material-UI's theming system and follows the template's design patterns:

- **Shape**: Rounded pagination buttons (`shape='rounded'`)
- **Color**: Primary color scheme (`color='primary'`)
- **Variant**: Tonal variant for better visibility (`variant='tonal'`)
- **Border**: Top border to separate from content
- **Layout**: Flexbox with space-between for responsive layout
- **Spacing**: Consistent padding and gaps using MUI spacing

## Integration with Laravel API

The component is designed to work seamlessly with Laravel's pagination format:

```typescript
// Laravel API Response
{
  "data": [
    { "id": 1, "title": "Music 1" },
    { "id": 2, "title": "Music 2" }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 50
  }
}

// Usage
const response = await musicService.list(page, perPage)
<Pagination
  page={page}
  perPage={perPage}
  meta={response.meta}
  onPageChange={setPage}
  onPerPageChange={setPerPage}
/>
```

## Examples

### Complete Example with Data Fetching

```typescript
'use client'

import { useEffect, useState } from 'react'
import { usePagination } from '@/hooks/usePagination'
import Pagination from '@/components/common/Pagination'
import { musicService } from '@/services/music.service'
import type { Music, MusicListResponse } from '@/types/music.types'

export default function MusicListPage() {
  const { page, perPage, setPage, setPerPage } = usePagination({
    defaultPerPage: 25
  })
  
  const [musics, setMusics] = useState<Music[]>([])
  const [meta, setMeta] = useState<MusicListResponse['meta'] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchMusics = async () => {
      setLoading(true)
      try {
        const response = await musicService.list(page, perPage)
        setMusics(response.data)
        setMeta(response.meta)
      } catch (error) {
        console.error('Failed to fetch musics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMusics()
  }, [page, perPage])

  return (
    <div>
      <h1>Music List</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="music-grid">
            {musics.map(music => (
              <div key={music.id} className="music-card">
                <h3>{music.title}</h3>
                <p>{music.duration}s</p>
              </div>
            ))}
          </div>

          {meta && (
            <Pagination
              page={page}
              perPage={perPage}
              meta={meta}
              onPageChange={setPage}
              onPerPageChange={setPerPage}
            />
          )}
        </>
      )}
    </div>
  )
}
```

### With Search and Filters

```typescript
function MusicListWithSearch() {
  const { page, perPage, setPage, setPerPage } = usePagination()
  const [search, setSearch] = useState('')
  const [musics, setMusics] = useState([])
  const [meta, setMeta] = useState(null)

  useEffect(() => {
    const fetchMusics = async () => {
      const response = await musicService.search({
        query: search,
        page,
        per_page: perPage
      })
      setMusics(response.data)
      setMeta(response.meta)
    }
    fetchMusics()
  }, [page, perPage, search])

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1) // Reset to page 1 on search
        }}
        placeholder="Search music..."
      />

      {/* Music list */}
      <div>{/* ... */}</div>

      <Pagination
        page={page}
        perPage={perPage}
        meta={meta}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />
    </div>
  )
}
```

## Accessibility

The component inherits Material-UI's accessibility features:
- Keyboard navigation support
- ARIA labels for screen readers
- Focus management
- Disabled state handling

## Related

- [usePagination Hook](../../hooks/usePagination.README.md) - Pagination state management hook
- [FileUpload Component](./FileUpload.tsx) - File upload component
- [Material-UI Pagination](https://mui.com/material-ui/react-pagination/) - MUI Pagination documentation

## Notes

- The component automatically disables pagination when there's only one page or no items
- The per page selector resets the page to 1 when changed (handled by `usePagination`)
- URL synchronization is handled by the `usePagination` hook, not the component
- The component is fully responsive and adapts to different screen sizes
- The component follows the template's design system for consistency
