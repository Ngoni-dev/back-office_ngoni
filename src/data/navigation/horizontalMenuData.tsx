// Type Imports
import type { HorizontalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const horizontalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): HorizontalMenuDataType[] => [
  {
    label: dictionary['navigation']?.dashboard ?? 'Dashboard',
    icon: 'tabler-smart-home',
    href: '/'
  },
  {
    label: dictionary['navigation']?.ngoni ?? 'Ngoni',
    icon: 'tabler-music',
    children: [
      {
        label: dictionary['navigation']?.music ?? 'Music',
        href: '/apps/ngoni/music'
      },
      {
        label: dictionary['navigation']?.artists ?? 'Artists',
        href: '/apps/ngoni/artists'
      },
      {
        label: dictionary['navigation']?.genres ?? 'Genres',
        href: '/apps/ngoni/genres'
      },
      {
        label: dictionary['navigation']?.licenses ?? 'Licenses',
        href: '/apps/ngoni/licenses'
      },
      {
        label: dictionary['navigation']?.giftProducts ?? 'Gift Products',
        href: '/apps/ngoni/gift-products'
      }
    ]
  }
]

export default horizontalMenuData
