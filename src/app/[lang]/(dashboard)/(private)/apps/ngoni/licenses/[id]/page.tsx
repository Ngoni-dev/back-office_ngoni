// Component Imports
import LicenseDetails from '@views/apps/ngoni/licenses/LicenseDetails'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Détails licence - Ngoni Admin',
  description: 'Voir et modifier une licence musicale'
}

interface LicenseDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function LicenseDetailsPage({ params }: LicenseDetailsPageProps) {
  const { id } = await params

  return <LicenseDetails id={id} />
}
