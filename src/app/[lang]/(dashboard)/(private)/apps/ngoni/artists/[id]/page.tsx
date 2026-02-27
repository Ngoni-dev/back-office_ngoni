// Component Imports
import ArtistDetails from '@views/apps/ngoni/artists/ArtistDetails'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Détails Artiste - Ngoni Admin',
  description: 'Voir et modifier les détails d\'un artiste'
}

interface ArtistDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function ArtistDetailsPage({ params }: ArtistDetailsPageProps) {
  const { id } = await params

  return <ArtistDetails id={id} />
}
