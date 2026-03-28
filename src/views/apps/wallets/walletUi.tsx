'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import StatusBadge, { type StatusBadgeTone } from '@/components/StatusBadge'
import type { AuditAction, AuditStatus, WalletStatus, WalletTxStatus, WalletTxType } from '@/services/wallet.service'

/** Devise affichée par défaut quand l’API ne renvoie pas de code (wallets internes). */
export const DEFAULT_WALLET_CURRENCY = 'XOF'

export function currencyLabelFr(code: string | null | undefined): string {
  const c = (code?.trim() || DEFAULT_WALLET_CURRENCY).toUpperCase()
  switch (c) {
    case 'XOF':
      return 'FCFA'
    case 'XAF':
      return 'FCFA (CEMAC)'
    case 'EUR':
      return 'Euro'
    case 'USD':
      return 'Dollar US'
    case 'GBP':
      return 'Livre sterling'
    default:
      return c
  }
}

export function MoneyCell({ value, currency }: { value: unknown; currency?: string | null }) {
  const code = currency?.trim() || DEFAULT_WALLET_CURRENCY
  return (
    <Box sx={{ lineHeight: 1.25, py: 0.25 }}>
      <Typography variant='body2' fontWeight={600} component='div'>
        {formatAmount(value)}
      </Typography>
      <Typography variant='caption' color='text.secondary' component='div' sx={{ display: 'block' }}>
        {currencyLabelFr(code)}
      </Typography>
    </Box>
  )
}

/** Bloc montant + devise pour en-têtes / cartes (détail wallet). */
export function MoneyBlock({
  label,
  value,
  currency,
  emphasized
}: {
  label: string
  value: unknown
  currency?: string | null
  emphasized?: boolean
}) {
  const code = currency?.trim() || DEFAULT_WALLET_CURRENCY
  return (
    <Box>
      <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant={emphasized ? 'h5' : 'h6'} fontWeight={emphasized ? 700 : 600}>
        {formatAmount(value)}
      </Typography>
      <Typography variant='caption' color='text.secondary'>
        {currencyLabelFr(code)}
      </Typography>
    </Box>
  )
}

export function walletStatusChip(status: WalletStatus) {
  switch (status) {
    case 'ACTIVE':
      return <StatusBadge label='Actif' tone='success' />
    case 'FROZEN':
      return <StatusBadge label='Gelé' tone='warning' />
    case 'SUSPENDED':
      return <StatusBadge label='Suspendu' tone='error' />
    default:
      return <StatusBadge label={String(status)} tone='neutral' />
  }
}

const TX_STATUS_META: Record<WalletTxStatus, { label: string; tone: StatusBadgeTone }> = {
  SUCCESS: { label: 'Réussi', tone: 'success' },
  FAILED: { label: 'Échoué', tone: 'error' },
  PENDING: { label: 'En attente', tone: 'warning' },
  PROCESSING: { label: 'En cours', tone: 'info' },
  CANCELLED: { label: 'Annulé', tone: 'neutral' }
}

export function txStatusChip(status: WalletTxStatus) {
  const m = TX_STATUS_META[status] ?? { label: String(status), tone: 'neutral' as const }
  return <StatusBadge label={m.label} tone={m.tone} />
}

const TX_TYPE_MAP: Record<WalletTxType, string> = {
  TOPUP: 'Recharge',
  WITHDRAWAL: 'Retrait',
  TRANSFER: 'Transfert',
  GIFT: 'Cadeau',
  TIP: 'Pourboire',
  REWARD: 'Récompense',
  PURCHASE: 'Achat',
  REFUND: 'Remboursement'
}

export function txTypeLabelFr(type: WalletTxType): string {
  return TX_TYPE_MAP[type] ?? type
}

export const TX_STATUS_FILTER_OPTIONS: { value: WalletTxStatus; label: string }[] = (
  Object.entries(TX_STATUS_META) as [WalletTxStatus, { label: string }][]
).map(([value, { label }]) => ({ value, label }))

export const TX_TYPE_FILTER_OPTIONS: { value: WalletTxType; label: string }[] = (
  Object.entries(TX_TYPE_MAP) as [WalletTxType, string][]
)
  .map(([value, label]) => ({ value, label }))
  .sort((a, b) => a.label.localeCompare(b.label, 'fr'))

const AUDIT_STATUS_META: Record<AuditStatus, { label: string; tone: StatusBadgeTone }> = {
  SUCCESS: { label: 'Réussi', tone: 'success' },
  FAILED: { label: 'Échoué', tone: 'error' },
  PENDING: { label: 'En attente', tone: 'warning' },
  WARNING: { label: 'Attention', tone: 'info' }
}

export const AUDIT_STATUS_FILTER_OPTIONS: { value: AuditStatus; label: string }[] = (
  Object.entries(AUDIT_STATUS_META) as [AuditStatus, { label: string }][]
).map(([value, { label }]) => ({ value, label }))

export function auditStatusChip(status: AuditStatus) {
  const m = AUDIT_STATUS_META[status] ?? { label: status, tone: 'neutral' as const }
  return <StatusBadge label={m.label} tone={m.tone} />
}

const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  PAYMENT_INITIATED: 'Paiement initié',
  PAYMENT_SUCCESS: 'Paiement réussi',
  PAYMENT_FAILED: 'Paiement échoué',
  PAYMENT_RETRIED: 'Paiement relancé',
  WITHDRAWAL_REQUESTED: 'Retrait demandé',
  WITHDRAWAL_APPROVED: 'Retrait approuvé',
  WITHDRAWAL_FAILED: 'Retrait échoué',
  WITHDRAWAL_CANCELLED: 'Retrait annulé',
  TRANSFER_INITIATED: 'Transfert initié',
  TRANSFER_SUCCESS: 'Transfert réussi',
  TRANSFER_FAILED: 'Transfert échoué',
  KYC_TRIGGERED: 'Vérification KYC déclenchée',
  KYC_VERIFIED: 'Identité vérifiée',
  FRAUD_CHECK_TRIGGERED: 'Contrôle fraude',
  WALLET_LOCKED: 'Wallet verrouillé',
  WALLET_UNLOCKED: 'Wallet déverrouillé',
  DISPUTE_FILED: 'Litige ouvert',
  REFUND_INITIATED: 'Remboursement initié',
  REFUND_SUCCESS: 'Remboursement effectué',
  LIMIT_EXCEEDED: 'Plafond dépassé',
  PROVIDER_ERROR: 'Erreur prestataire',
  WEBHOOK_RECEIVED: 'Webhook reçu',
  WEBHOOK_PROCESSED: 'Webhook traité'
}

export function auditActionLabelFr(action: AuditAction): string {
  return AUDIT_ACTION_LABELS[action] ?? action.replace(/_/g, ' ')
}

/** Masque les libellés techniques type « genius pay » dans une référence affichée en liste. */
export function referenceDisplayFr(raw: string | null | undefined): string {
  if (raw == null || String(raw).trim() === '') return '—'
  let s = String(raw).trim()
  if (/genius/i.test(s)) {
    s = s.replace(/genius[\s_-]*pay/gi, 'paiement en ligne').replace(/genius/gi, 'paiement en ligne')
  }
  return s
}

export function providerLabelFr(raw: string | null | undefined): string {
  if (raw == null || String(raw).trim() === '') return '—'
  const n = String(raw).trim().toLowerCase().replace(/[\s-]+/g, '_')
  if (n.includes('genius')) return 'Paiement en ligne'
  if (n === 'stripe') return 'Stripe'
  if (n === 'paypal') return 'PayPal'
  if (n === 'momo' || n.includes('mobile_money')) return 'Mobile money'
  return raw
    .split(/[\s_-]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

export const AUDIT_ACTION_OPTIONS: { value: AuditAction; label: string }[] = (
  Object.entries(AUDIT_ACTION_LABELS) as [AuditAction, string][]
)
  .map(([value, label]) => ({ value, label }))
  .sort((a, b) => a.label.localeCompare(b.label, 'fr'))

export function formatAmount(value: unknown): string {
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return n.toLocaleString('fr-FR')
}
