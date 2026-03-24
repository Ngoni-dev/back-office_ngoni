// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

/**
 * Structure de menu vertical professionnelle (inspirée du template Vuexy).
 * Dashboard en premier, puis sections Administration et Contenu Ngoni.
 */
const verticalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): VerticalMenuDataType[] => [
  // Dashboard - accès principal
  {
    label: dictionary['navigation']?.dashboard ?? 'Dashboard',
    icon: 'tabler-smart-home',
    href: '/'
  },
  // Section Administration (BO-005, BO-006, BO-013, BO-027)
  {
    label: dictionary['navigation']?.administration ?? 'Administration',
    isSection: true,
    children: [
      {
        label: dictionary['navigation']?.administrateurs ?? 'Administrateurs',
        icon: 'tabler-users',
        href: '/apps/admin/administrateurs'
      },
      {
        label: dictionary['navigation']?.roles ?? 'Rôles',
        icon: 'tabler-shield-lock',
        href: '/apps/admin/roles'
      },
      {
        label: dictionary['navigation']?.users ?? 'Utilisateurs',
        icon: 'tabler-user',
        href: '/apps/users'
      },
      {
        label: dictionary['navigation']?.countries ?? 'Pays',
        icon: 'tabler-world',
        href: '/apps/countries'
      }
    ]
  },
  // Section Contenu Ngoni (Musiques, Artistes, Genres, Licences, Cadeaux)
  {
    label: dictionary['navigation']?.contentNgoni ?? 'Contenu Ngoni',
    isSection: true,
    children: [
      {
        label: dictionary['navigation']?.music ?? 'Musiques',
        icon: 'tabler-music',
        href: '/apps/ngoni/music'
      },
      {
        label: dictionary['navigation']?.artists ?? 'Artistes',
        icon: 'tabler-microphone-2',
        href: '/apps/ngoni/artists'
      },
      {
        label: dictionary['navigation']?.genres ?? 'Genres',
        icon: 'tabler-category',
        href: '/apps/ngoni/genres'
      },
      {
        label: dictionary['navigation']?.licenses ?? 'Licences',
        icon: 'tabler-license',
        href: '/apps/ngoni/licenses'
      },
      {
        label: dictionary['navigation']?.giftProducts ?? 'Produits cadeaux',
        icon: 'tabler-gift',
        href: '/apps/ngoni/gift-products'
      }
    ]
  }
]

export default verticalMenuData
