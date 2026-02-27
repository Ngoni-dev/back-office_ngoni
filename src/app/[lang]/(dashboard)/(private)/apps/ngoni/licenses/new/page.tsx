// Component Imports
import LicenseForm from '@views/apps/ngoni/licenses/LicenseForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nouvelle licence - Ngoni Admin',
  description: 'Créer une nouvelle licence musicale'
}

export default function NewLicensePage() {
  return <LicenseForm />
}
