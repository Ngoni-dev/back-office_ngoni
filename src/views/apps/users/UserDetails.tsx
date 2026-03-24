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

import { userService, type User } from '@/services/user.service'
import { getLocalizedUrl } from '@/utils/i18n'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'

const ROLE_LABELS: Record<string, string> = {
  PERSONAL: 'Personnel',
  BUSINESS: 'Entreprise',
  CREATOR: 'Créateur'
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  SUSPENDED: 'Suspendu',
  BANNED: 'Banni',
  PENDING_VERIFICATION: 'En attente'
}

export default function UserDetails() {
  const router = useRouter()
  const { lang, id } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      setLoading(true)
      userService
        .get(Number(id))
        .then(res => setUser(res.data))
        .catch(() => setUser(null))
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading || !user) {
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
          { label: 'Utilisateurs', href: getLocalizedUrl('/apps/users', lang as string) },
          { label: user.display_name ?? user.username }
        ]}
      />
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title='Fiche utilisateur'
              action={
                <Button variant='tonal' onClick={() => router.push(getLocalizedUrl('/apps/users', lang as string))}>
                  Retour
                </Button>
              }
            />
            <CardContent>
              <Box display='flex' alignItems='center' gap={3} mb={4}>
                <Avatar
                  src={user.avatar_url ?? undefined}
                  sx={{ width: 80, height: 80 }}
                >
                  {(user.display_name ?? user.username).charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant='h6'>{user.display_name ?? user.username}</Typography>
                  <Typography variant='body2' color='text.secondary'>@{user.username}</Typography>
                  <Box display='flex' gap={1} mt={1}>
                    <Chip label={ROLE_LABELS[user.role] ?? user.role} size='small' />
                    <Chip
                      label={STATUS_LABELS[user.status] ?? user.status}
                      size='small'
                      color={user.status === 'ACTIVE' ? 'success' : user.status === 'BANNED' ? 'error' : 'default'}
                    />
                  </Box>
                </Box>
              </Box>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant='caption' color='text.secondary'>Téléphone</Typography>
                  <Typography variant='body1'>{user.phone_number ?? '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant='caption' color='text.secondary'>Pays</Typography>
                  <Typography variant='body1'>{user.country?.name ?? '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant='caption' color='text.secondary'>Ville</Typography>
                  <Typography variant='body1'>{user.city ?? '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant='caption' color='text.secondary'>KYC</Typography>
                  <Typography variant='body1'>{user.kyc_status ?? '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant='caption' color='text.secondary'>Followers</Typography>
                  <Typography variant='body1'>{user.followers_count ?? 0}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant='caption' color='text.secondary'>Inscription</Typography>
                  <Typography variant='body1'>
                    {user.created_at ? new Date(user.created_at).toLocaleString('fr-FR') : '—'}
                  </Typography>
                </Grid>
                {user.bio && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant='caption' color='text.secondary'>Bio</Typography>
                    <Typography variant='body1'>{user.bio}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
