// Component Imports
import ArtistList from '@views/apps/ngoni/artists/ArtistList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Artistes - Ngoni Admin',
  description: 'Gérer les artistes Ngoni'
}

export default function ArtistsPage() {
  return <ArtistList />
}
