'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'

import { countryService } from '@/services/country.service'
import { getLocalizedUrl } from '@/utils/i18n'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import CustomTextField from '@core/components/mui/TextField'
import { toast } from 'react-toastify'

export default function CountryForm() {
  const router = useRouter()
  const { lang, id } = useParams()
  const isEdit = Boolean(id)

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true)
      countryService
        .get(Number(id))
        .then(res => {
          setName(res.data.name ?? '')
          setCode(res.data.code ?? '')
        })
        .finally(() => setLoading(false))
    }
  }, [isEdit, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) {
      toast.error('Nom et code sont requis')
      return
    }
    setSubmitting(true)
    try {
      if (isEdit) {
        await countryService.update(Number(id), {
          name: name.trim(),
          code: code.trim().toUpperCase()
        })
        toast.success('Pays mis à jour')
      } else {
        await countryService.create({
          name: name.trim(),
          code: code.trim().toUpperCase()
        })
        toast.success('Pays créé')
      }
      router.push(getLocalizedUrl('/apps/countries', lang as string))
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
          { label: 'Pays', href: getLocalizedUrl('/apps/countries', lang as string) },
          { label: isEdit ? 'Modifier' : 'Nouveau pays' }
        ]}
      />
      <Card>
        <CardHeader title={isEdit ? 'Modifier le pays' : 'Nouveau pays'} />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Nom'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="ex: Côte d'Ivoire"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Code ISO'
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                  placeholder='ex: CI'
                  inputProps={{ maxLength: 5 }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box display='flex' gap={2}>
                  <Button type='submit' variant='contained' disabled={submitting}>
                    {submitting ? 'Envoi...' : 'Enregistrer'}
                  </Button>
                  <Button variant='tonal' onClick={() => router.push(getLocalizedUrl('/apps/countries', lang as string))}>
                    Annuler
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
