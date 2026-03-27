'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { toast } from 'react-toastify'
import { certificationService, type Certification } from '@/services/certification.service'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import { getLocalizedUrl } from '@/utils/i18n'

export default function CertificationDetails() {
  const { id, lang } = useParams()
  const router = useRouter()
  const [data, setData] = useState<Certification | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await certificationService.get(Number(id))
      setData(res.data)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const review = async (status: 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED') => {
    try {
      await certificationService.review(Number(id), {
        status,
        ...(status === 'REJECTED' ? { rejection_reason: 'Rejeté par modération admin' } : {})
      })
      toast.success('Certification mise à jour')
      fetchData()
    } catch {
      toast.error('Échec de la revue certification')
    }
  }

  const toggleBadge = async (hasBadge: boolean) => {
    try {
      await certificationService.toggleBadge(Number(id), hasBadge)
      toast.success('Badge mis à jour')
      fetchData()
    } catch {
      toast.error('Échec mise à jour badge')
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' py={8}>
        <CircularProgress />
      </Box>
    )
  }

  if (!data) return <Typography>Aucune certification trouvée.</Typography>

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs
        items={[
          { label: 'Certifications', href: getLocalizedUrl('/apps/certifications', lang as string) },
          { label: `Demande #${data.id}` }
        ]}
      />
      <Card>
        <CardHeader title='Détail certification' subheader={data.user?.display_name ?? data.user?.username ?? `Utilisateur #${data.user_id}`} />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}><Typography><strong>Statut:</strong> {data.status}</Typography></Grid>
            <Grid size={{ xs: 12, md: 6 }}><Typography><strong>Badge:</strong> {data.has_certified_badge ? 'Oui' : 'Non'}</Typography></Grid>
            <Grid size={{ xs: 12 }}><Typography><strong>Nom:</strong> {data.full_name}</Typography></Grid>
            <Grid size={{ xs: 12 }}><Typography><strong>Téléphone:</strong> {data.phone_number}</Typography></Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant='contained' color='warning' onClick={() => review('IN_REVIEW')}>Passer en revue</Button>
                <Button variant='contained' color='success' onClick={() => review('APPROVED')}>Approuver</Button>
                <Button variant='contained' color='error' onClick={() => review('REJECTED')}>Rejeter</Button>
                <Button variant='outlined' onClick={() => toggleBadge(!data.has_certified_badge)}>
                  {data.has_certified_badge ? 'Retirer badge' : 'Attribuer badge'}
                </Button>
                <Button variant='tonal' onClick={() => router.push(getLocalizedUrl('/apps/certifications', lang as string))}>Retour</Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}
