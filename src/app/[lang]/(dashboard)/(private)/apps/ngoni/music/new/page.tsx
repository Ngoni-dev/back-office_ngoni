// Component Imports
import MusicForm from '@views/apps/ngoni/music/MusicForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nouvelle Musique - Ngoni Admin',
  description: 'Ajouter une nouvelle musique au catalogue Ngoni'
}

export default function NewMusicPage() {
  return <MusicForm />
}
