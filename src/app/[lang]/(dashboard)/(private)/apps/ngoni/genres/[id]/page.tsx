// Component Imports
import GenreDetails from '@views/apps/ngoni/genres/GenreDetails'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Détails Genre - Ngoni Admin',
  description: 'Voir et modifier les détails d\'un genre'
}

interface GenreDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function GenreDetailsPage({ params }: GenreDetailsPageProps) {
  const { id } = await params

  return <GenreDetails id={id} />
}
