// Component Imports
import MusicList from '@views/apps/ngoni/music/MusicList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Musiques - Ngoni Admin',
  description: 'Gérer le catalogue de musiques Ngoni'
}

export default function MusicPage() {
  return <MusicList />
}
