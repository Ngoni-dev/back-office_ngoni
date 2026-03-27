'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import StatusBadge from '@/components/StatusBadge'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Services
import { adminService } from '@/services/admin.service'

// Types
import type { Admin } from '@/types/admin.types'

// Utils
import { getLocalizedUrl } from '@/utils/i18n'

// Components
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux-store'
import { hasPermission } from '@/utils/acl'
import { toast } from 'react-toastify'

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  moderator: 'Modérateur'
}

function creatorLine(admin: Admin): string {
  const c = admin.created_by
  if (c && typeof c === 'object') {
    return `${c.name} ${c.first_names}`.trim()
  }
  if (typeof c === 'number') {
    return `#${c}`
  }
  return '—'
}

export default function AdminDetails() {
  const router = useRouter()
  const { lang, id } = useParams()
  const authUser = useSelector((state: RootState) => state.auth.user)
  const canWriteAdmins = hasPermission(authUser, 'admins.write')

  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      adminService.get(Number(id))
        .then(res => setAdmin(res.data))
        .catch(() => setAdmin(null))
        .finally(() => setLoading(false))
    }
  }, [id])

  const handleRestore = async () => {
    if (!admin) return
    try {
      await adminService.restore(admin.id)
      toast.success('Administrateur restauré')
      const res = await adminService.get(admin.id)
      setAdmin(res.data)
    } catch {
      toast.error('Restauration impossible')
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' py={8}>
        <CircularProgress />
      </Box>
    )
  }

  if (!admin) {
    return <Typography color='error'>Administrateur introuvable</Typography>
  }

  const isDeleted = Boolean(admin.deleted_at)
  const aclNames = admin.acl_roles?.map(r => r.name).filter(Boolean) ?? []

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs
        items={[
          { label: 'Administrateurs', href: getLocalizedUrl('/apps/admin/administrateurs', lang as string) },
          { label: `${admin.name} ${admin.first_names}` }
        ]}
      />

      {isDeleted && (
        <Alert severity='warning' sx={{ mb: 4 }} action={
          canWriteAdmins ? (
            <Button color='inherit' size='small' onClick={handleRestore}>
              Restaurer
            </Button>
          ) : undefined
        }>
          Ce compte est archivé (soft delete). Les actions de modification sont désactivées jusqu’à restauration.
        </Alert>
      )}

      <Card>
        <CardHeader
          title='Fiche administrateur'
          subheader={admin.email}
          action={
            <Stack direction='row' spacing={2} flexWrap='wrap' useFlexGap>
              <Button variant='tonal' onClick={() => router.push(getLocalizedUrl('/apps/admin/administrateurs', lang as string))}>
                Retour liste
              </Button>
              {canWriteAdmins && !isDeleted && (
                <Button variant='contained' onClick={() => router.push(getLocalizedUrl(`/apps/admin/administrateurs/${id}/edit`, lang as string))}>
                  Modifier
                </Button>
              )}
            </Stack>
          }
        />
        <CardContent>
          <Box display='flex' alignItems='flex-start' justifyContent='space-between' gap={4} flexWrap='wrap' mb={4}>
            <Box display='flex' alignItems='center' gap={3}>
              <Avatar src={admin.photo || undefined} sx={{ width: 88, height: 88 }}>
                {admin.name?.charAt(0)}{admin.first_names?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant='h5'>{admin.name} {admin.first_names}</Typography>
                <Typography variant='body2' color='text.secondary'>{admin.email}</Typography>
                <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap sx={{ mt: 1.5 }}>
                  <StatusBadge label={ROLE_LABELS[admin.role] ?? admin.role} tone='primary' />
                  <StatusBadge tone={admin.status ? 'success' : 'neutral'} label={admin.status ? 'Actif' : 'Inactif'} />
                  {aclNames.map(n => (
                    <StatusBadge key={n} tone='secondary' label={`ACL: ${n}`} />
                  ))}
                </Stack>
              </Box>
            </Box>
          </Box>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 2 }}>
                    Coordonnées
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant='caption' color='text.secondary'>Contact principal</Typography>
                      <Typography variant='body2'>{admin.first_contact}</Typography>
                    </Grid>
                    {admin.contact_second && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant='caption' color='text.secondary'>Contact secondaire</Typography>
                        <Typography variant='body2'>{admin.contact_second}</Typography>
                      </Grid>
                    )}
                    <Grid size={{ xs: 12 }}>
                      <Typography variant='caption' color='text.secondary'>Pays</Typography>
                      <Typography variant='body2'>{admin.country?.name ?? '—'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant='caption' color='text.secondary'>Ville</Typography>
                      <Typography variant='body2'>{admin.city ?? '—'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant='caption' color='text.secondary'>Langue</Typography>
                      <Typography variant='body2'>{admin.language ?? '—'}</Typography>
                    </Grid>
                    {admin.adresse && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant='caption' color='text.secondary'>Adresse</Typography>
                        <Typography variant='body2'>{admin.adresse}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 2 }}>
                    Métadonnées
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant='caption' color='text.secondary'>Créé par</Typography>
                      <Typography variant='body2'>{creatorLine(admin)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant='caption' color='text.secondary'>Création</Typography>
                      <Typography variant='body2'>
                        {admin.created_at ? new Date(admin.created_at).toLocaleString('fr-FR') : '—'}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant='caption' color='text.secondary'>Mise à jour</Typography>
                      <Typography variant='body2'>
                        {admin.updated_at ? new Date(admin.updated_at).toLocaleString('fr-FR') : '—'}
                      </Typography>
                    </Grid>
                    {isDeleted && admin.deleted_at && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant='caption' color='text.secondary'>Archivé le</Typography>
                        <Typography variant='body2' color='warning.main'>
                          {new Date(admin.deleted_at).toLocaleString('fr-FR')}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {admin.bio && (
              <Grid size={{ xs: 12 }}>
                <Card variant='outlined'>
                  <CardHeader title='Bio' />
                  <CardContent>
                    <Typography variant='body2'>{admin.bio}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}
