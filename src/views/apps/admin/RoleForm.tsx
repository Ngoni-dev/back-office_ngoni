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
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'

import { roleService } from '@/services/role.service'
import type { Permission } from '@/services/role.service'
import { getLocalizedUrl } from '@/utils/i18n'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import CustomTextField from '@core/components/mui/TextField'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux-store'
import { hasPermission } from '@/utils/acl'

export default function RoleForm() {
  const router = useRouter()
  const { lang, id } = useParams()
  const isEdit = Boolean(id)
  const authUser = useSelector((state: RootState) => state.auth.user)
  const canWriteRoles = hasPermission(authUser, 'roles.write')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])

  useEffect(() => {
    roleService.permissions().then(res => setPermissions(res.data ?? [])).catch(() => setPermissions([]))
    if (isEdit && id) {
      setLoading(true)
      roleService.get(Number(id))
        .then(res => {
          setName(res.data.name ?? '')
          setDescription(res.data.description ?? '')
          setSelectedPermissionIds((res.data.permissions ?? []).map(p => p.id))
        })
        .finally(() => setLoading(false))
    }
  }, [isEdit, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Le nom est requis')
      return
    }
    setSubmitting(true)
    try {
      if (isEdit) {
        await roleService.update(Number(id), {
          name: name.trim(),
          description: description.trim() || undefined,
          permission_ids: selectedPermissionIds
        })
        toast.success('Rôle mis à jour')
      } else {
        await roleService.create({
          name: name.trim(),
          description: description.trim() || undefined,
          permission_ids: selectedPermissionIds
        })
        toast.success('Rôle créé')
      }
      router.push(getLocalizedUrl('/apps/admin/roles', lang as string))
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
          { label: 'Rôles', href: getLocalizedUrl('/apps/admin/roles', lang as string) },
          { label: isEdit ? 'Modifier' : 'Nouveau rôle' }
        ]}
      />
      <Card>
        <CardHeader title={isEdit ? 'Modifier le rôle' : 'Nouveau rôle'} />
        <CardContent>
          {!canWriteRoles ? (
            <Typography color='text.secondary'>Vous n’avez pas la permission de modifier les rôles.</Typography>
          ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12 }}>
                <CustomTextField fullWidth label='Nom' value={name} onChange={e => setName(e.target.value)} required placeholder='ex: finance, support' />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomTextField fullWidth multiline rows={3} label='Description' value={description} onChange={e => setDescription(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant='subtitle2' sx={{ mb: 2 }}>
                  Permissions
                </Typography>
                <FormGroup>
                  {permissions.map(permission => (
                    <FormControlLabel
                      key={permission.id}
                      control={
                        <Checkbox
                          checked={selectedPermissionIds.includes(permission.id)}
                          onChange={e =>
                            setSelectedPermissionIds(prev =>
                              e.target.checked
                                ? [...prev, permission.id]
                                : prev.filter(id => id !== permission.id)
                            )
                          }
                        />
                      }
                      label={`${permission.name}${permission.description ? ` - ${permission.description}` : ''}`}
                    />
                  ))}
                </FormGroup>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box display='flex' gap={2}>
                  <Button type='submit' variant='contained' disabled={submitting}>{submitting ? 'Envoi...' : 'Enregistrer'}</Button>
                  <Button variant='tonal' onClick={() => router.push(getLocalizedUrl('/apps/admin/roles', lang as string))}>Annuler</Button>
                </Box>
              </Grid>
            </Grid>
          </form>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
