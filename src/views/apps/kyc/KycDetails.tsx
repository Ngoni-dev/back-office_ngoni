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
import { kycService, type KycDocument } from '@/services/kyc.service'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import { getLocalizedUrl } from '@/utils/i18n'

export default function KycDetails() {
  const { id, lang } = useParams()
  const router = useRouter()
  const [data, setData] = useState<KycDocument | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await kycService.get(Number(id))
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

  const review = async (status: 'APPROVED' | 'REJECTED') => {
    try {
      await kycService.review(Number(id), {
        status,
        ...(status === 'REJECTED' ? { rejection_reason: 'Rejeté par modération admin' } : {})
      })
      toast.success('Revue KYC mise à jour')
      fetchData()
    } catch {
      toast.error('Échec de la revue KYC')
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' py={8}>
        <CircularProgress />
      </Box>
    )
  }

  if (!data) return <Typography>Aucun document KYC trouvé.</Typography>

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs
        items={[
          { label: 'KYC', href: getLocalizedUrl('/apps/kyc', lang as string) },
          { label: `Document #${data.id}` }
        ]}
      />
      <Card>
        <CardHeader title='Détail KYC' subheader={data.user?.display_name ?? data.user?.username ?? `Utilisateur #${data.user_id}`} />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}><Typography><strong>Type:</strong> {data.document_type}</Typography></Grid>
            <Grid size={{ xs: 12, md: 6 }}><Typography><strong>Statut:</strong> {data.status}</Typography></Grid>
            <Grid size={{ xs: 12 }}><Typography><strong>Document URL:</strong> {data.document_path}</Typography></Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant='contained' color='success' onClick={() => review('APPROVED')}>Approuver</Button>
                <Button variant='contained' color='error' onClick={() => review('REJECTED')}>Rejeter</Button>
                <Button variant='tonal' onClick={() => router.push(getLocalizedUrl('/apps/kyc', lang as string))}>Retour</Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}
