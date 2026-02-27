// Component Imports
import ArtistForm from '@views/apps/ngoni/artists/ArtistForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nouvel Artiste - Ngoni Admin',
  description: 'Ajouter un nouvel artiste'
}

export default function NewArtistPage() {
  return <ArtistForm />
}
