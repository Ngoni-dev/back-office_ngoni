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
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

// Services
import { adminService } from '@/services/admin.service'

// Types
import type { Admin } from '@/types/admin.types'

// Utils
import { getLocalizedUrl } from '@/utils/i18n'

// Components
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  moderator: 'Modérateur'
}

export default function AdminDetails() {
  const router = useRouter()
  const { lang, id } = useParams()
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

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs
        items={[
          { label: 'Administrateurs', href: getLocalizedUrl('/apps/admin/administrateurs', lang as string) },
          { label: `${admin.name} ${admin.first_names}` }
        ]}
      />
      <Card>
        <CardHeader
          title={`${admin.name} ${admin.first_names}`}
          subheader={admin.email}
          action={
            <Button variant='contained' onClick={() => router.push(getLocalizedUrl(`/apps/admin/administrateurs/${id}/edit`, lang as string))}>
              Modifier
            </Button>
          }
        />
        <CardContent>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
                <Avatar src={admin.photo || undefined} sx={{ width: 100, height: 100 }}>
                  {admin.name?.charAt(0)}{admin.first_names?.charAt(0)}
                </Avatar>
                <Chip color={admin.status ? 'success' : 'default'} label={admin.status ? 'Actif' : 'Inactif'} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant='body2' color='text.secondary'>Rôle</Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>{ROLE_LABELS[admin.role] ?? admin.role}</Typography>

              <Typography variant='body2' color='text.secondary'>Contact principal</Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>{admin.first_contact}</Typography>

              {admin.contact_second && (
                <>
                  <Typography variant='body2' color='text.secondary'>Contact secondaire</Typography>
                  <Typography variant='body1' sx={{ mb: 2 }}>{admin.contact_second}</Typography>
                </>
              )}

              <Typography variant='body2' color='text.secondary'>Pays</Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>{admin.country?.name ?? '—'}</Typography>

              {admin.city && (
                <>
                  <Typography variant='body2' color='text.secondary'>Ville</Typography>
                  <Typography variant='body1' sx={{ mb: 2 }}>{admin.city}</Typography>
                </>
              )}

              {admin.adresse && (
                <>
                  <Typography variant='body2' color='text.secondary'>Adresse</Typography>
                  <Typography variant='body1' sx={{ mb: 2 }}>{admin.adresse}</Typography>
                </>
              )}

              {admin.bio && (
                <>
                  <Typography variant='body2' color='text.secondary'>Bio</Typography>
                  <Typography variant='body1'>{admin.bio}</Typography>
                </>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}
