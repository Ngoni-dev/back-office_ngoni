import type { Metadata } from 'next'
import NgoniContentDashboard from '@views/apps/ngoni/NgoniContentDashboard'

export const metadata: Metadata = {
  title: 'Dashboard Ngoni Content - Ngoni Admin',
  description: 'Vue globale Musiques et Gift Products'
}

export default function NgoniDashboardPage() {
  return <NgoniContentDashboard />
}
