'use client'

import { toast } from 'react-toastify'
// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Service Imports
import { licenseService } from '@/services/license.service'
import { musicService } from '@/services/music.service'

// Type Imports
import type { LicenseCreateRequest } from '@/types/license.types'
import type { Music } from '@/types/music.types'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Third-party Imports
import { fr } from 'date-fns/locale'

// Utils - dates in YYYY-MM-DD for API, avoid timezone issues
const toYyyyMmDd = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const parseYyyyMmDd = (s: string): Date | null => {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null
  return new Date(y, m - 1, d)
}

// Component Imports
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import CustomTextField from '@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

export default function LicenseForm() {
  const router = useRouter()
  const { lang } = useParams()

  const [musics, setMusics] = useState<Music[]>([])
  const [musicId, setMusicId] = useState<number | ''>('')
  const [ownerName, setOwnerName] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [monetizable, setMonetizable] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await musicService.list(1, 300, { skip404Toast: true })
        setMusics(res.data ?? [])
      } catch {
        setMusics([])
      }
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (musicId === '' || !ownerName.trim() || !licenseType.trim() || !startDate) {
      toast.error('Musique, propriétaire, type et date de début sont requis')
      return
    }
    if (endDate && startDate && new Date(endDate) <= new Date(startDate)) {
      toast.error('La date de fin doit être après la date de début')
      return
    }

    setSubmitting(true)
    try {
      const data: LicenseCreateRequest = {
        music_id: Number(musicId),
        owner_name: ownerName.trim(),
        license_type: licenseType.trim(),
        start_date: startDate,
        end_date: endDate || null,
        monetizable
      }
      const response = await licenseService.create(data)
      const created = response?.data
      toast.success('Licence créée avec succès')
      if (created?.id) {
        router.push(getLocalizedUrl(`/apps/ngoni/licenses/${created.id}`, lang as string))
      } else {
        router.push(getLocalizedUrl('/apps/ngoni/licenses', lang as string))
      }
    } catch {
      // Erreurs API déjà affichées par l'intercepteur
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(getLocalizedUrl('/apps/ngoni/licenses', lang as string))
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs
        items={[
          { label: 'Licences', href: getLocalizedUrl('/apps/ngoni/licenses', lang as string) },
          { label: 'Nouvelle licence' }
        ]}
      />
      <Card sx={{ width: '100%' }}>
        <CardHeader
          title='Nouvelle licence'
          action={
            <Button
              variant='tonal'
              color='secondary'
              startIcon={<i className='tabler-arrow-left' />}
              onClick={handleCancel}
            >
              Retour à la liste
            </Button>
          }
        />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12 }}>
                <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                  Licence
                </Typography>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  select
                  fullWidth
                  label='Musique'
                  value={musicId}
                  onChange={e => setMusicId(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                >
                  <MenuItem value="">Sélectionner une musique</MenuItem>
                  {musics.map(m => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.title} (ID: {m.id})
                    </MenuItem>
                  ))}
                </CustomTextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Nom du propriétaire'
                  placeholder='Ex: Société XYZ'
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  required
                />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Type de licence'
                  placeholder='Ex: exclusive, non-exclusive'
                  value={licenseType}
                  onChange={e => setLicenseType(e.target.value)}
                  required
                />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={monetizable}
                      onChange={e => setMonetizable(e.target.checked)}
                    />
                  }
                  label='Monétisable'
                />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                  Période
                </Typography>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                <AppReactDatepicker
                  selected={parseYyyyMmDd(startDate)}
                  onChange={(date: Date | null) => setStartDate(date ? toYyyyMmDd(date) : '')}
                  locale={fr}
                  dateFormat='dd/MM/yyyy'
                  placeholderText='JJ/MM/AAAA'
                  showYearDropdown
                  showMonthDropdown
                  todayButton="Aujourd'hui"
                  customInput={
                    <CustomTextField fullWidth label='Date de début' required />
                  }
                />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                <AppReactDatepicker
                  selected={parseYyyyMmDd(endDate)}
                  onChange={(date: Date | null) => setEndDate(date ? toYyyyMmDd(date) : '')}
                  locale={fr}
                  dateFormat='dd/MM/yyyy'
                  placeholderText='JJ/MM/AAAA'
                  showYearDropdown
                  showMonthDropdown
                  todayButton="Aujourd'hui"
                  isClearable
                  clearButtonTitle='Effacer'
                  customInput={
                    <CustomTextField
                      fullWidth
                      label='Date de fin (optionnel)'
                      helperText='Laisser vide pour licence sans expiration'
                    />
                  }
                />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box display='flex' gap={2} justifyContent='flex-end'>
                  <Button variant='tonal' color='secondary' onClick={handleCancel} disabled={submitting}>
                    Annuler
                  </Button>
                  <Button
                    type='submit'
                    variant='contained'
                    disabled={submitting || !musicId || !ownerName.trim() || !licenseType.trim() || !startDate}
                    startIcon={submitting ? <CircularProgress size={20} /> : <i className='tabler-check' />}
                  >
                    {submitting ? 'Création...' : 'Créer'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
