// Component Imports
import GenreList from '@views/apps/ngoni/genres/GenreList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Genres - Ngoni Admin',
  description: 'Gérer les genres musicaux Ngoni'
}

export default function GenresPage() {
  return <GenreList />
}

