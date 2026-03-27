'use client'

import { fr } from 'date-fns/locale'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomTextField from '@core/components/mui/TextField'

type Props = {
  label: string
  value: string
  onChange: (next: string) => void
  required?: boolean
  size?: 'small' | 'medium'
  fullWidth?: boolean
}

// Dates in YYYY-MM-DD for API, avoid timezone issues
const toYyyyMmDd = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const parseYyyyMmDd = (s: string): Date | null => {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null
  return new Date(y, m - 1, d)
}

export default function DateFilterField({ label, value, onChange, required, size = 'small', fullWidth }: Props) {
  return (
    <AppReactDatepicker
      selected={parseYyyyMmDd(value)}
      onChange={(date: Date | null) => onChange(date ? toYyyyMmDd(date) : '')}
      locale={fr}
      dateFormat='dd/MM/yyyy'
      placeholderText='JJ/MM/AAAA'
      showYearDropdown
      showMonthDropdown
      todayButton="Aujourd'hui"
      customInput={<CustomTextField fullWidth={fullWidth} size={size} label={label} required={required} />}
    />
  )
}

