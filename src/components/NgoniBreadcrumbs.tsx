'use client'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Typography from '@mui/material/Typography'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Type Imports
import type { Locale } from '@/configs/i18n'

type BreadcrumbItem = {
  label: string
  href?: string
}

type Props = {
  items: BreadcrumbItem[]
}

export default function NgoniBreadcrumbs({ items }: Props) {
  const { lang } = useParams()
  const locale = lang as Locale

  return (
    <Breadcrumbs aria-label='breadcrumb' className='mbe-4'>
      <Link className='text-textSecondary hover:text-primary' href={getLocalizedUrl('/', locale)}>
        Dashboard
      </Link>
      <Typography color='text.secondary'>Ngoni</Typography>
      {items.map((item, idx) =>
        item.href && idx < items.length - 1 ? (
          <Link
            key={idx}
            className='text-textSecondary hover:text-primary'
            href={getLocalizedUrl(item.href, locale)}
          >
            {item.label}
          </Link>
        ) : (
          <Typography key={idx} color='text.primary' fontWeight={500}>
            {item.label}
          </Typography>
        )
      )}
    </Breadcrumbs>
  )
}
