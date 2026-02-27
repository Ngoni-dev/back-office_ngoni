'use client'

import { toast } from 'react-toastify'
// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'

// Service Imports
import { licenseService } from '@/services/license.service'

// Type Imports
import type { MusicLicense, LicenseUpdateRequest, RegionRestriction } from '@/types/license.types'

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
import tableStyles from '@core/styles/table.module.css'

interface LicenseDetailsProps {
  id: string
}

export default function LicenseDetails({ id }: LicenseDetailsProps) {
  const router = useRouter()
  const { lang } = useParams()

  const [license, setLicense] = useState<MusicLicense | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [ownerName, setOwnerName] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [monetizable, setMonetizable] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Restrictions: add dialog
  const [addRestrictionOpen, setAddRestrictionOpen] = useState(false)
  const [restrictionCountryId, setRestrictionCountryId] = useState('')
  const [restrictionType, setRestrictionType] = useState('blocked')
  const [restrictionSubmitting, setRestrictionSubmitting] = useState(false)
  // Remove confirmation
  const [removeRestrictionOpen, setRemoveRestrictionOpen] = useState(false)
  const [restrictionToRemove, setRestrictionToRemove] = useState<RegionRestriction | null>(null)
  const [removeSubmitting, setRemoveSubmitting] = useState(false)

  const fetchLicense = async () => {
    try {
      const response = await licenseService.get(Number(id))
      const data = response?.data ?? response
      if (!data) throw new Error('Invalid response')
      setLicense(data)
      setOwnerName(data.owner_name ?? '')
      setLicenseType(data.license_type ?? '')
      setStartDate(data.start_date ? data.start_date.slice(0, 10) : '')
      setEndDate(data.end_date ? data.end_date.slice(0, 10) : '')
      setMonetizable(data.monetizable ?? false)
    } catch {
      toast.error('Erreur lors du chargement de la licence')
      router.push(getLocalizedUrl('/apps/ngoni/licenses', lang as string))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLicense()
  }, [id, router, lang])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ownerName.trim() || !licenseType.trim() || !startDate) {
      toast.error('Propriétaire, type et date de début sont requis')
      return
    }
    if (endDate && new Date(endDate) <= new Date(startDate)) {
      toast.error('La date de fin doit être après la date de début')
      return
    }
    setSubmitting(true)
    try {
      const data: LicenseUpdateRequest = {
        owner_name: ownerName.trim(),
        license_type: licenseType.trim(),
        start_date: startDate,
        end_date: endDate || null,
        monetizable
      }
      const updated = await licenseService.update(Number(id), data)
      setLicense(updated.data)
      setEditing(false)
      toast.success('Licence mise à jour')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (license) {
      setOwnerName(license.owner_name ?? '')
      setLicenseType(license.license_type ?? '')
      setStartDate(license.start_date ? license.start_date.slice(0, 10) : '')
      setEndDate(license.end_date ? license.end_date.slice(0, 10) : '')
      setMonetizable(license.monetizable ?? false)
    }
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette licence ?')) return
    try {
      await licenseService.delete(Number(id))
      toast.success('Licence supprimée')
      router.push(getLocalizedUrl('/apps/ngoni/licenses', lang as string))
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const restrictions = (license?.regionRestrictions ?? license?.region_restrictions) ?? []

  const handleAddRestriction = async () => {
    const cid = restrictionCountryId.trim()
    if (!cid || isNaN(Number(cid))) {
      toast.error('ID pays invalide')
      return
    }
    setRestrictionSubmitting(true)
    try {
      await licenseService.addRestriction(Number(id), {
        country_id: Number(cid),
        restriction_type: restrictionType
      })
      toast.success('Restriction ajoutée')
      setAddRestrictionOpen(false)
      setRestrictionCountryId('')
      setRestrictionType('blocked')
      await fetchLicense()
    } catch {
      toast.error('Erreur lors de l\'ajout de la restriction')
    } finally {
      setRestrictionSubmitting(false)
    }
  }

  const handleRemoveRestrictionClick = (r: RegionRestriction) => {
    setRestrictionToRemove(r)
    setRemoveRestrictionOpen(true)
  }

  const handleConfirmRemoveRestriction = async () => {
    if (!restrictionToRemove) return
    setRemoveSubmitting(true)
    try {
      await licenseService.removeRestriction(Number(id), restrictionToRemove.id)
      toast.success('Restriction supprimée')
      setRemoveRestrictionOpen(false)
      setRestrictionToRemove(null)
      await fetchLicense()
    } catch {
      toast.error('Erreur lors de la suppression de la restriction')
    } finally {
      setRemoveSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (!license) {
    return <Alert severity='error'>Licence introuvable</Alert>
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs
        items={[
          { label: 'Licences', href: getLocalizedUrl('/apps/ngoni/licenses', lang as string) },
          { label: `Licence #${license.id}` }
        ]}
      />
      {/* Header unifié */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant='h4' fontWeight={600}>
            Licence #{license.id}
          </Typography>
          {license.is_expired ? (
            <Chip label='Expirée' size='small' color='error' variant='tonal' />
          ) : license.is_active ? (
            <Chip label='Active' size='small' color='success' variant='tonal' />
          ) : (
            <Chip label='À venir' size='small' variant='outlined' />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant='tonal'
            color='secondary'
            size='medium'
            startIcon={<i className='tabler-arrow-left' />}
            onClick={() => router.push(getLocalizedUrl('/apps/ngoni/licenses', lang as string))}
          >
            Liste
          </Button>
          {!editing ? (
            <>
              <Button variant='contained' size='medium' startIcon={<i className='tabler-edit' />} onClick={() => setEditing(true)}>
                Modifier
              </Button>
              <Button variant='tonal' color='error' size='medium' startIcon={<i className='tabler-trash' />} onClick={handleDelete}>
                Supprimer
              </Button>
            </>
          ) : (
            <>
              <Button variant='tonal' color='secondary' size='medium' onClick={handleCancel} disabled={submitting}>
                Annuler
              </Button>
              <Button
                variant='contained'
                size='medium'
                startIcon={submitting ? <CircularProgress size={18} color='inherit' /> : <i className='tabler-check' />}
                disabled={submitting || !ownerName.trim() || !licenseType.trim() || !startDate}
                onClick={e => handleUpdate(e)}
              >
                {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Grid container spacing={6} sx={{ width: '100%', minWidth: 0 }} alignItems='flex-start'>
        {/* Colonne principale */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
          <Card sx={{ width: '100%' }}>
            <CardContent sx={{ p: 6 }}>
              {editing ? (
                <form onSubmit={handleUpdate}>
                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CustomTextField fullWidth label='Propriétaire' value={ownerName} onChange={e => setOwnerName(e.target.value)} required />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CustomTextField fullWidth label='Type de licence' value={licenseType} onChange={e => setLicenseType(e.target.value)} required />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControlLabel
                        control={<Checkbox checked={monetizable} onChange={e => setMonetizable(e.target.checked)} />}
                        label='Monétisable'
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <AppReactDatepicker
                        selected={parseYyyyMmDd(startDate)}
                        onChange={(date: Date | null) => setStartDate(date ? date.toISOString().slice(0, 10) : '')}
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
                          <CustomTextField fullWidth label='Date de fin (optionnel)' />
                        }
                      />
                    </Grid>
                  </Grid>
                </form>
              ) : (
                <>
                  {/* Informations générales */}
                  <Box sx={{ mb: 5 }}>
                    <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                      Informations générales
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>ID</Typography>
                        <Typography variant='body1' fontWeight={500}>{license.id}</Typography>
                      </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Musique</Typography>
                        <Typography variant='body1' fontWeight={500}>{license.music?.title ?? `#${license.music_id}`}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Propriétaire</Typography>
                        <Typography variant='body1' fontWeight={500}>{license.owner_name ?? '—'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Type</Typography>
                        <Typography variant='body1' fontWeight={500}>{license.license_type ?? '—'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Monétisable</Typography>
                        <Typography variant='body1' fontWeight={500}>{license.monetizable ? 'Oui' : 'Non'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Date de début</Typography>
                        <Typography variant='body1' fontWeight={500}>
                          {license.start_date ? new Date(license.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Date de fin</Typography>
                        <Typography variant='body1' fontWeight={500}>
                          {license.end_date ? new Date(license.end_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Illimitée'}
                        </Typography>
                      </Grid>
                  </Grid>
                  </Box>

                  <Divider sx={{ my: 4 }} />

                  {/* Historique */}
                  <Box>
                    <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                      Historique
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Date de création</Typography>
                        <Typography variant='body1'>{license.created_at ? new Date(license.created_at).toLocaleString('fr-FR') : '—'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Dernière modification</Typography>
                        <Typography variant='body1'>{license.updated_at ? new Date(license.updated_at).toLocaleString('fr-FR') : '—'}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar: Restrictions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ width: '100%', position: 'sticky', top: 100 }}>
            <CardHeader
              title='Restrictions régionales'
              action={
                <Button variant='contained' size='small' startIcon={<i className='tabler-plus' />} onClick={() => setAddRestrictionOpen(true)}>
                  Ajouter
                </Button>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              {restrictions.length === 0 ? (
                <Typography variant='body2' color='text.secondary'>Aucune restriction</Typography>
              ) : (
                <div className='overflow-x-auto'>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th>Pays</th>
                        <th>Type</th>
                        <th align='right'>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restrictions.map(r => (
                        <tr key={r.id}>
                          <td>{r.country_name ?? `#${r.country_id}`}</td>
                          <td>{r.restriction_type ?? '—'}</td>
                          <td align='right'>
                            <IconButton size='small' color='error' onClick={() => handleRemoveRestrictionClick(r)}>
                              <i className='tabler-trash' />
                            </IconButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add restriction dialog */}
      <Dialog open={addRestrictionOpen} onClose={() => setAddRestrictionOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Ajouter une restriction</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                type='number'
                label='ID du pays'
                placeholder="ID du pays"
                value={restrictionCountryId}
                onChange={e => setRestrictionCountryId(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={restrictionType} label='Type' onChange={e => setRestrictionType(e.target.value)}>
                  <MenuItem value='blocked'>Bloqué</MenuItem>
                  <MenuItem value='limited'>Limité</MenuItem>
                  <MenuItem value='restricted'>Restreint</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant='tonal' color='secondary' onClick={() => setAddRestrictionOpen(false)} disabled={restrictionSubmitting}>Annuler</Button>
          <Button variant='contained' onClick={handleAddRestriction} disabled={restrictionSubmitting || !restrictionCountryId.trim()} startIcon={restrictionSubmitting ? <CircularProgress size={20} /> : <i className='tabler-check' />}>
            {restrictionSubmitting ? 'Ajout...' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove restriction confirmation */}
      <Dialog open={removeRestrictionOpen} onClose={() => setRemoveRestrictionOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Supprimer la restriction</DialogTitle>
        <DialogContent>
          <Typography>Êtes-vous sûr de vouloir supprimer cette restriction ?</Typography>
          {restrictionToRemove && (
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              Pays {restrictionToRemove.country_name ?? `#${restrictionToRemove.country_id}`} – {restrictionToRemove.restriction_type}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant='tonal' color='secondary' onClick={() => setRemoveRestrictionOpen(false)} disabled={removeSubmitting}>Annuler</Button>
          <Button variant='contained' color='error' onClick={handleConfirmRemoveRestriction} disabled={removeSubmitting} startIcon={removeSubmitting ? <CircularProgress size={20} /> : <i className='tabler-trash' />}>
            {removeSubmitting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
