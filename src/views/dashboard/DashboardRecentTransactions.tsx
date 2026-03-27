'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import OptionMenu from '@core/components/option-menu'
import tableStyles from '@core/styles/table.module.css'
import type { DashboardRecentTransaction } from '@/types/dashboard.types'
import StatusBadge, { type StatusBadgeTone } from '@/components/StatusBadge'

function statusChip(status: string) {
  const s = String(status ?? '').toUpperCase()
  const map: Record<string, { label: string; tone: StatusBadgeTone }> = {
    SUCCESS: { label: 'Réussi', tone: 'success' },
    FAILED: { label: 'Échoué', tone: 'error' },
    PROCESSING: { label: 'En cours', tone: 'info' },
    PENDING: { label: 'En attente', tone: 'warning' },
    CANCELLED: { label: 'Annulé', tone: 'neutral' }
  }
  const m = map[s]
  if (m) return <StatusBadge label={m.label} tone={m.tone} />
  return <StatusBadge label={status || '—'} tone='neutral' />
}

function formatMoney(v: unknown, currency?: string | null) {
  const n = Number(v)
  if (Number.isNaN(n)) return '—'
  const cur = currency ?? ''
  return `${n.toLocaleString('fr-FR')}${cur ? ` ${cur}` : ''}`
}

export default function DashboardRecentTransactions({
  items,
  onShowAll
}: {
  items: DashboardRecentTransaction[]
  onShowAll?: () => void
}) {
  return (
    <Card>
      <CardHeader
        title={
          <Box display='flex' alignItems='baseline' gap={1} flexWrap='wrap'>
            <Typography variant='h6'>Dernières transactions</Typography>
            <Typography variant='body2' color='text.secondary'>
              Les 5 dernières opérations
            </Typography>
          </Box>
        }
        action={
          <OptionMenu
            options={[
              ...(onShowAll ? [{ text: 'Voir tout', icon: <i className='tabler-list' />, menuItemProps: { onClick: onShowAll } }] : []),
              { text: 'Rafraîchir', icon: <i className='tabler-refresh' /> }
            ]}
          />
        }
      />

      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead className='uppercase'>
            <tr className='border-be'>
              <th className='leading-6 plb-4 pis-6 pli-2'>ID</th>
              <th className='leading-6 plb-4 pli-2'>Utilisateur</th>
              <th className='leading-6 plb-4 pie-6 pli-2 text-right'>Type</th>
            </tr>
          </thead>
          <tbody>
            {items.map(tx => (
              <tr key={tx.id} className='border-0'>
                <td className='pis-6 pli-2 plb-3'>
                  <Typography color='text.primary'>#{tx.id}</Typography>
                  <Typography variant='body2' color='text.disabled'>
                    {tx.created_at ? new Date(tx.created_at).toLocaleString('fr-FR') : '—'}
                  </Typography>
                </td>
                <td className='pli-2 plb-3'>
                  <Typography color='text.primary'>
                    {tx.user?.display_name ?? tx.user?.username ?? `#${tx.user_id}`}
                  </Typography>
                  <Typography variant='body2' color='text.disabled'>
                    Wallet #{tx.wallet_id}
                  </Typography>
                </td>
                <td className='pli-2 plb-3 pie-6 text-right'>
                  <Typography color='text.primary' className='font-medium'>
                    {tx.type}
                  </Typography>
                  <div className='flex justify-end mt-1'>{statusChip(tx.status)}</div>
                  <Typography variant='body2' color='text.disabled'>
                    {tx.reference_id ?? tx.provider_transaction_id ?? '—'}
                  </Typography>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={3} className='text-center text-secondary'>
                  Aucune transaction
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

