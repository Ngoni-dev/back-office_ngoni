'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'

// Services
import { adminService } from '@/services/admin.service'
import { countryService } from '@/services/country.service'
import { roleService } from '@/services/role.service'
import type { Country } from '@/services/country.service'
import type { Role } from '@/services/role.service'

// Utils
import { getLocalizedUrl } from '@/utils/i18n'

// Components
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import CustomTextField from '@core/components/mui/TextField'
import { toast } from 'react-toastify'

export default function AdminForm() {
  const router = useRouter()
  const { lang, id } = useParams()
  const isEdit = Boolean(id)

  const [name, setName] = useState('')
  const [firstNames, setFirstNames] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [role, setRole] = useState('admin')
  const [firstContact, setFirstContact] = useState('')
  const [contactSecond, setContactSecond] = useState('')
  const [countryId, setCountryId] = useState<number | ''>('')
  const [bio, setBio] = useState('')
  const [adresse, setAdresse] = useState('')
  const [city, setCity] = useState('')
  const [status, setStatus] = useState(true)
  const [countries, setCountries] = useState<Country[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      countryService.list().then(res => setCountries(res.data ?? [])).catch(() => setCountries([])),
      roleService.list().then(res => setRoles(res.data ?? [])).catch(() => setRoles([]))
    ])
  }, [])

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true)
      adminService.get(Number(id))
        .then(res => {
          const a = res.data
          setName(a.name ?? '')
          setFirstNames(a.first_names ?? '')
          setEmail(a.email ?? '')
          setRole(a.role ?? 'admin')
          setFirstContact(a.first_contact ?? '')
          setContactSecond(a.contact_second ?? '')
          setCountryId(a.country_id ?? '')
          setBio(a.bio ?? '')
          setAdresse(a.adresse ?? '')
          setCity(a.city ?? '')
          setStatus(a.status ?? true)
        })
        .catch(() => toast.error('Erreur chargement'))
        .finally(() => setLoading(false))
    }
  }, [isEdit, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !firstNames.trim() || !email.trim() || !firstContact.trim() || !countryId) {
      toast.error('Champs requis manquants')
      return
    }
    if (!isEdit && (!password || password.length < 8)) {
      toast.error('Mot de passe min. 8 caractères')
      return
    }
    if (!isEdit && password !== passwordConfirmation) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        await adminService.update(Number(id), {
          name: name.trim(),
          first_names: firstNames.trim(),
          email: email.trim(),
          role,
          first_contact: firstContact.trim(),
          contact_second: contactSecond.trim() || undefined,
          country_id: Number(countryId),
          bio: bio.trim() || undefined,
          adresse: adresse.trim() || undefined,
          city: city.trim() || undefined,
          status,
          ...(password ? { password, password_confirmation: passwordConfirmation } : {})
        })
        toast.success('Administrateur mis à jour')
      } else {
        await adminService.create({
          name: name.trim(),
          first_names: firstNames.trim(),
          email: email.trim(),
          password,
          password_confirmation: passwordConfirmation,
          role,
          first_contact: firstContact.trim(),
          contact_second: contactSecond.trim() || undefined,
          country_id: Number(countryId),
          bio: bio.trim() || undefined,
          adresse: adresse.trim() || undefined,
          city: city.trim() || undefined
        })
        toast.success('Administrateur créé')
      }
      router.push(getLocalizedUrl('/apps/admin/administrateurs', lang as string))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' py={8}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs
        items={[
          { label: 'Administrateurs', href: getLocalizedUrl('/apps/admin/administrateurs', lang as string) },
          { label: isEdit ? 'Modifier' : 'Nouvel admin' }
        ]}
      />
      <Card>
        <CardHeader title={isEdit ? 'Modifier' : 'Nouvel administrateur'} />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField fullWidth label='Nom' value={name} onChange={e => setName(e.target.value)} required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField fullWidth label='Prénoms' value={firstNames} onChange={e => setFirstNames(e.target.value)} required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField fullWidth type='email' label='Email' value={email} onChange={e => setEmail(e.target.value)} required disabled={isEdit} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Rôle</InputLabel>
                  <Select value={role} label='Rôle' onChange={e => setRole(e.target.value)}>
                    {(roles.length > 0 ? roles : [
                      { id: 0, name: 'super_admin', description: '' },
                      { id: 1, name: 'admin', description: '' },
                      { id: 2, name: 'moderator', description: '' }
                    ]).map(r => (
                      <MenuItem key={r.id} value={r.name}>{r.name}{r.description ? ` – ${r.description}` : ''}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {!isEdit && (
                <>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomTextField fullWidth type='password' label='Mot de passe' value={password} onChange={e => setPassword(e.target.value)} required />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomTextField fullWidth type='password' label='Confirmation' value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} required />
                  </Grid>
                </>
              )}
              {isEdit && (
                <>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomTextField fullWidth type='password' label='Nouveau mot de passe' value={password} onChange={e => setPassword(e.target.value)} placeholder='Laisser vide pour garder' />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomTextField fullWidth type='password' label='Confirmation' value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} />
                  </Grid>
                </>
              )}
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField fullWidth label='Contact principal' value={firstContact} onChange={e => setFirstContact(e.target.value)} required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField fullWidth label='Contact secondaire' value={contactSecond} onChange={e => setContactSecond(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Pays</InputLabel>
                  <Select value={countryId} label='Pays' onChange={e => setCountryId(e.target.value ? Number(e.target.value) : '')}>
                    {countries.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.name} ({c.code})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField fullWidth label='Ville' value={city} onChange={e => setCity(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomTextField fullWidth label='Adresse' value={adresse} onChange={e => setAdresse(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomTextField fullWidth multiline rows={3} label='Bio' value={bio} onChange={e => setBio(e.target.value)} />
              </Grid>
              {isEdit && (
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel control={<Switch checked={status} onChange={e => setStatus(e.target.checked)} />} label='Actif' />
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <Box display='flex' gap={2}>
                  <Button type='submit' variant='contained' disabled={submitting}>{submitting ? 'Envoi...' : 'Enregistrer'}</Button>
                  <Button variant='tonal' onClick={() => router.push(getLocalizedUrl('/apps/admin/administrateurs', lang as string))}>Annuler</Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
