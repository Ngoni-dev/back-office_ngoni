// Component Imports
import NotFound from '@views/NotFound'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Config Imports
import { i18n } from '@configs/i18n'

const Error = async (props: { params: Promise<{ lang: string }> }) => {
  const params = await props.params
  const lang = i18n.locales.includes(params.lang as any) ? params.lang : i18n.defaultLocale
  const mode = await getServerMode()

  return <NotFound mode={mode} lang={lang} />
}

export default Error
