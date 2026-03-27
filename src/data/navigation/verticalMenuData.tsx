// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

/**
 * Sidebar structurée façon Vuexy:
 * - Sections (séparateurs)
 * - Sous-menus déroulants (groupes)
 * - Items unitaires
 */
const verticalMenuData = (
  dictionary: Awaited<ReturnType<typeof getDictionary>>,
  permissions: string[] = [],
  role?: string
): VerticalMenuDataType[] => {
  const can = (permission: string) => role === 'super_admin' || permissions.includes(permission)

  const compact = (items: VerticalMenuDataType[]) => items.filter(Boolean)

  const submenu = (label: string, icon: string, children: VerticalMenuDataType[]): VerticalMenuDataType[] =>
    children.length > 0 ? [{ label, icon, children }] : []

  const section = (label: string, children: VerticalMenuDataType[]): VerticalMenuDataType[] =>
    children.length > 0 ? [{ label, isSection: true, children }] : []

  // Dashboard
  const dashboards: VerticalMenuDataType[] = [
    {
      label: dictionary['navigation']?.dashboard ?? 'Dashboard',
      icon: 'tabler-smart-home',
      href: '/'
    }
  ]

  // Administration
  const adminChildren = compact([
    ...(can('admins.read')
      ? [
          {
            label: dictionary['navigation']?.administrateurs ?? 'Administrateurs',
            icon: 'tabler-users',
            href: '/apps/admin/administrateurs'
          }
        ]
      : []),
    ...(can('roles.read')
      ? [
          {
            label: dictionary['navigation']?.roles ?? 'Rôles',
            icon: 'tabler-shield-lock',
            href: '/apps/admin/roles'
          }
        ]
      : [])
  ])

  // Utilisateurs & Conformité
  const usersChildren = compact([
    ...(can('users.read')
      ? [
          {
            label: dictionary['navigation']?.users ?? 'Utilisateurs',
            icon: 'tabler-user',
            href: '/apps/users'
          }
        ]
      : []),
    ...(can('kyc.read')
      ? [
          {
            label: 'KYC',
            icon: 'tabler-id-badge-2',
            href: '/apps/kyc'
          },
          {
            label: 'Certifications',
            icon: 'tabler-rosette-discount-check',
            href: '/apps/certifications'
          }
        ]
      : [])
  ])

  // Contenu (UGC)
  const videosChildren = compact([
    ...(can('video.read')
      ? [
          { label: 'Liste vidéos', icon: 'tabler-video', href: '/apps/videos' },
          { label: 'Tables vidéos', icon: 'tabler-table', href: '/apps/videos/tables' }
        ]
      : []),
    ...(can('video.write') ? [{ label: 'Modération', icon: 'tabler-shield-check', href: '/apps/videos/moderation' }] : [])
  ])

  const contentChildren = compact([
    ...submenu('Vidéos', 'tabler-video', videosChildren),
    ...(can('comments.read') ? [{ label: 'Commentaires', icon: 'tabler-message', href: '/apps/comments' }] : []),
    ...(can('stories.read') ? [{ label: 'Stories', icon: 'tabler-photo', href: '/apps/stories' }] : []),
    ...(can('hashtags.read') ? [{ label: 'Hashtags', icon: 'tabler-hash', href: '/apps/hashtags' }] : [])
  ])

  // Finance
  const financeChildren = compact([
    ...(can('wallets.read')
      ? [
          { label: 'Wallets', icon: 'tabler-wallet', href: '/apps/wallets' },
          { label: 'Transactions', icon: 'tabler-receipt', href: '/apps/wallets/transactions' },
          { label: 'Verrous', icon: 'tabler-lock', href: '/apps/wallets/locks' },
          { label: 'Audit', icon: 'tabler-file-text', href: '/apps/wallets/audit' }
        ]
      : [])
  ])

  // Référentiels
  const referentialsChildren = compact([
    ...(can('countries.read')
      ? [{ label: dictionary['navigation']?.countries ?? 'Pays', icon: 'tabler-world', href: '/apps/countries' }]
      : [])
  ])

  // Ngoni Content (catalogues internes) - découpage propre en familles
  const ngoniMusicChildren = compact([
    ...(can('music.read')
      ? [
          { label: dictionary['navigation']?.music ?? 'Musiques', icon: 'tabler-music', href: '/apps/ngoni/music' },
          { label: dictionary['navigation']?.artists ?? 'Artistes', icon: 'tabler-microphone-2', href: '/apps/ngoni/artists' },
          { label: dictionary['navigation']?.genres ?? 'Genres', icon: 'tabler-category', href: '/apps/ngoni/genres' },
          { label: dictionary['navigation']?.licenses ?? 'Licences', icon: 'tabler-license', href: '/apps/ngoni/licenses' }
        ]
      : [])
  ])

  const ngoniGiftsChildren = compact([
    ...(can('music.read')
      ? [{ label: dictionary['navigation']?.giftProducts ?? 'Produits cadeaux', icon: 'tabler-gift', href: '/apps/ngoni/gift-products' }]
      : [])
  ])

  return [
    ...section(dictionary['navigation']?.dashboards ?? 'Dashboards', dashboards),
    ...section(dictionary['navigation']?.administration ?? 'Administration', [
      ...submenu(dictionary['navigation']?.administration ?? 'Administration', 'tabler-settings', adminChildren),
      ...submenu(dictionary['navigation']?.users ?? 'Utilisateurs', 'tabler-user-circle', usersChildren)
    ]),
    ...section('Contenu', [
      ...submenu('UGC', 'tabler-photo-video', contentChildren)
    ]),
    ...section('Finance', [
      ...submenu('Wallets', 'tabler-wallet', financeChildren)
    ]),
    ...section('Référentiels', [
      ...submenu('Référentiels', 'tabler-database', referentialsChildren)
    ]),
    ...section(dictionary['navigation']?.contentNgoni ?? 'Contenu Ngoni', [
      ...submenu(dictionary['navigation']?.contentNgoni ?? 'Ngoni Content', 'tabler-box', [
        ...(can('music.read') ? [{ label: 'Dashboard', icon: 'tabler-chart-dots-3', href: '/apps/ngoni/dashboard' }] : []),
        ...submenu('Musique', 'tabler-music', ngoniMusicChildren),
        ...submenu('Cadeaux', 'tabler-gift', ngoniGiftsChildren)
      ])
    ])
  ]
}

export default verticalMenuData
