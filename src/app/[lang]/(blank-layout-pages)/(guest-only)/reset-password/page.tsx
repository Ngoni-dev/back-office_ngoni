// Next Imports
import type { Metadata } from 'next'

// Component Imports
import ResetPassword from '@views/ResetPassword'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Réinitialiser le mot de passe - Ngoni Admin',
  description: 'Définir un nouveau mot de passe administrateur'
}

const ResetPasswordPage = async () => {
  const mode = await getServerMode()
  return <ResetPassword mode={mode} />
}

export default ResetPasswordPage
