// Component Imports
import GenreForm from '@views/apps/ngoni/genres/GenreForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nouveau Genre - Ngoni Admin',
  description: 'Ajouter un nouveau genre musical'
}

export default function NewGenrePage() {
  return <GenreForm />
}
