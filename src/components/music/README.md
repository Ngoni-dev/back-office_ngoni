# Music Components

This directory contains all UI components for the Music management module.

## Components

### MusicList
A comprehensive list component with search and pagination functionality.

**Features:**
- Paginated music grid display
- Advanced search filters (title, artist, genre, status)
- Integration with useMusic hook
- Empty state handling
- Loading states
- Error handling

**Props:**
- `onEdit?: (music: Music) => void` - Callback when edit is clicked
- `onDelete?: (music: Music) => void` - Callback when delete is clicked
- `onStatusChange?: (music: Music) => void` - Callback when status change is clicked
- `onView?: (music: Music) => void` - Callback when view details is clicked
- `onCreate?: () => void` - Callback when create button is clicked

### MusicForm
Form component for creating and editing music entries.

**Features:**
- Create and edit modes
- Audio file upload (create mode only)
- Form validation with Valibot
- Integration with FileUpload component
- Support for metadata (language, country, original flag)
- Placeholder for artist and genre selection (to be implemented)

**Props:**
- `music?: Music` - Music object for edit mode (optional)
- `onSubmit: (data: MusicCreateRequest | MusicUpdateRequest) => Promise<void>` - Form submission handler
- `onCancel?: () => void` - Cancel button handler
- `loading?: boolean` - Loading state

### MusicCard
Card component displaying music information with actions.

**Features:**
- Music title and status badge
- Duration, artists, genres display
- Uploader information
- Likes and usage count
- Action menu (view, edit, status change, delete)
- Verified artist badges

**Props:**
- `music: Music` - Music object to display
- `onEdit?: (music: Music) => void` - Edit action handler
- `onDelete?: (music: Music) => void` - Delete action handler
- `onStatusChange?: (music: Music) => void` - Status change handler
- `onView?: (music: Music) => void` - View details handler

### MusicStatusBadge
Simple badge component for displaying music status.

**Features:**
- Color-coded status display
- Localized status labels (French)
- Material-UI Chip component

**Props:**
- `status: MusicStatus` - Music status (pending, approved, rejected, blocked)

## Usage Example

```tsx
import { MusicList, MusicForm, MusicCard, MusicStatusBadge } from '@/components/music'

// In a page component
function MusicPage() {
  const handleEdit = (music: Music) => {
    // Navigate to edit page or open modal
  }

  const handleDelete = (music: Music) => {
    // Show confirmation dialog
  }

  return (
    <MusicList
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={() => router.push('/music/new')}
    />
  )
}
```

## Integration

These components are designed to work with:
- `useMusic` hook for state management
- `musicService` for API calls
- Redux `musicSlice` for global state
- Material-UI components for consistent styling
- `FileUpload` component for audio file uploads
- `Pagination` component for list navigation

## Requirements Validated

- ✅ 5.4: Liste paginée des musiques
- ✅ 5.5: Recherche avancée de musiques
- ✅ 5.6: Création de musique avec upload audio
- ✅ 5.11: Changement de statut de musique
- ✅ 10.1, 10.2, 10.3: Réutilisation des composants Material-UI

## Future Enhancements

- Artist and genre multi-select in MusicForm (requires Artist and Genre modules)
- Audio player preview in MusicCard
- Bulk actions in MusicList
- Advanced filtering options
- Export functionality
