// Component Imports
import LicenseList from '@views/apps/ngoni/licenses/LicenseList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Licences - Ngoni Admin',
  description: 'Gérer les licences musicales Ngoni'
}

export default function LicensesPage() {
  return <LicenseList />
}
