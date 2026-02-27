// Component Imports
import MusicDetails from '@views/apps/ngoni/music/MusicDetails'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Détails Musique - Ngoni Admin',
  description: 'Voir et modifier les détails d\'une musique'
}

interface MusicDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function MusicDetailsPage({ params }: MusicDetailsPageProps) {
  const { id } = await params

  return <MusicDetails id={id} />
}
