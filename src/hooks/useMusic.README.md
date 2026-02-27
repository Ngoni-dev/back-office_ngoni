# useMusic Hook

Custom React hook for managing music operations with Redux state management.

## Overview

The `useMusic` hook provides a clean interface for all music-related operations in the Ngoni Admin back-office. It connects to the Redux store and the music service to handle CRUD operations, file uploads, and status management.

## Features

- ✅ Fetch paginated list of musics
- ✅ Advanced search with filters
- ✅ Create music with audio file upload
- ✅ Update music metadata
- ✅ Delete music
- ✅ Update music status (pending, approved, rejected, blocked)
- ✅ Upload progress tracking
- ✅ Error handling
- ✅ Loading states

## Usage

```typescript
import { useMusic } from '@/hooks/useMusic'

function MusicList() {
  const {
    musics,
    pagination,
    loading,
    error,
    uploading,
    fetchMusics,
    searchMusics,
    createMusic,
    updateMusic,
    deleteMusic,
    updateMusicStatus
  } = useMusic()

  // Fetch musics on mount
  useEffect(() => {
    fetchMusics(1, 15)
  }, [])

  // Handle create
  const handleCreate = async (data: MusicCreateRequest) => {
    try {
      await createMusic(data)
      toast.success('Music created successfully')
    } catch (err) {
      toast.error('Failed to create music')
    }
  }

  return (
    <div>
      {loading && <Spinner />}
      {error && <Alert severity="error">{error}</Alert>}
      {musics.map(music => (
        <MusicCard key={music.id} music={music} />
      ))}
    </div>
  )
}
```

## API Reference

### State

#### `musics: Music[]`
Array of music objects from the Redux store.

#### `pagination: PaginationMeta | null`
Pagination metadata including current page, total items, etc.

#### `loading: boolean`
Indicates if an operation is in progress.

#### `error: string | null`
Error message if an operation failed.

#### `uploading: boolean`
Indicates if a file upload is in progress (separate from loading).

### Methods

#### `fetchMusics(page?: number, perPage?: number): Promise<void>`
Fetches a paginated list of musics.

**Parameters:**
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Items per page (default: 15)

**Example:**
```typescript
await fetchMusics(1, 20)
```

#### `searchMusics(params: MusicSearchParams): Promise<void>`
Searches musics with advanced filters.

**Parameters:**
- `params`: Search parameters object
  - `title?: string` - Search by title
  - `artist?: string` - Filter by artist
  - `genre?: string` - Filter by genre
  - `status?: MusicStatus` - Filter by status
  - `country_id?: number` - Filter by country
  - `language?: string` - Filter by language
  - `is_original?: boolean` - Filter original/cover
  - `page?: number` - Page number
  - `per_page?: number` - Items per page

**Example:**
```typescript
await searchMusics({
  title: 'love',
  status: 'approved',
  page: 1,
  per_page: 20
})
```

#### `createMusic(data: MusicCreateRequest): Promise<Music>`
Creates a new music with audio file upload.

**Parameters:**
- `data`: Music creation data
  - `title: string` - Music title (required)
  - `audio_file: File` - Audio file (required)
  - `country_id?: number` - Country ID
  - `language?: string` - Language code
  - `is_original?: boolean` - Is original composition
  - `artist_ids?: number[]` - Associated artist IDs
  - `genre_ids?: number[]` - Associated genre IDs

**Returns:** Created music object

**Example:**
```typescript
const file = event.target.files[0]
const music = await createMusic({
  title: 'My Song',
  audio_file: file,
  artist_ids: [1, 2],
  genre_ids: [3]
})
```

#### `updateMusic(id: number, data: MusicUpdateRequest): Promise<Music>`
Updates an existing music's metadata.

**Parameters:**
- `id`: Music ID
- `data`: Update data (all fields optional)
  - `title?: string`
  - `country_id?: number`
  - `language?: string`
  - `is_original?: boolean`
  - `artist_ids?: number[]`
  - `genre_ids?: number[]`

**Returns:** Updated music object

**Example:**
```typescript
await updateMusic(1, {
  title: 'Updated Title',
  artist_ids: [1, 2, 3]
})
```

#### `deleteMusic(id: number): Promise<void>`
Deletes a music.

**Parameters:**
- `id`: Music ID

**Example:**
```typescript
await deleteMusic(1)
```

#### `updateMusicStatus(id: number, status: MusicStatus): Promise<Music>`
Updates a music's status.

**Parameters:**
- `id`: Music ID
- `status`: New status ('pending' | 'approved' | 'rejected' | 'blocked')

**Returns:** Updated music object

**Example:**
```typescript
await updateMusicStatus(1, 'approved')
```

## Error Handling

All methods throw errors that should be caught and handled:

```typescript
try {
  await createMusic(data)
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to create music:', error.message)
  }
}
```

The hook also sets the `error` state which can be displayed in the UI:

```typescript
{error && <Alert severity="error">{error}</Alert>}
```

## Loading States

The hook provides two loading indicators:

1. **`loading`**: General loading state for fetch, update, delete operations
2. **`uploading`**: Specific state for file upload operations

```typescript
{loading && <CircularProgress />}
{uploading && <LinearProgress />}
```

## Integration with Redux

The hook automatically updates the Redux store:

- `fetchMusics` / `searchMusics` → Updates `musics` and `pagination`
- `createMusic` → Adds music to the beginning of the list
- `updateMusic` / `updateMusicStatus` → Updates the music in the list
- `deleteMusic` → Removes music from the list

## Requirements Validation

This hook validates the following requirements:

- **5.2**: Music module has useMusic hook for CRUD operations
- **5.4**: Display paginated list of musics
- **5.5**: Advanced search functionality
- **5.6**: Create music with audio file upload
- **5.8**: View music details
- **5.9**: Update music metadata
- **5.10**: Delete music
- **5.11**: Update music status

## Related Files

- Service: `src/services/music.service.ts`
- Redux Slice: `src/redux-store/slices/musicSlice.ts`
- Types: `src/types/music.types.ts`
- Tests: `src/hooks/__tests__/useMusic.test.ts`
