// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const verticalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): VerticalMenuDataType[] => [
  {
    label: dictionary['navigation']?.dashboard ?? 'Dashboard',
    icon: 'tabler-smart-home',
    href: '/'
  },
  {
    label: dictionary['navigation'].appsPages,
    isSection: true,
    children: [
      {
        label: dictionary['navigation']?.ngoni ?? 'Ngoni',
        icon: 'tabler-music',
        children: [
          {
            label: dictionary['navigation']?.music ?? 'Music',
            icon: 'tabler-music',
            href: '/apps/ngoni/music'
          },
          {
            label: dictionary['navigation']?.artists ?? 'Artists',
            icon: 'tabler-microphone-2',
            href: '/apps/ngoni/artists'
          },
          {
            label: dictionary['navigation']?.genres ?? 'Genres',
            icon: 'tabler-category',
            href: '/apps/ngoni/genres'
          },
          {
            label: dictionary['navigation']?.licenses ?? 'Licenses',
            icon: 'tabler-license',
            href: '/apps/ngoni/licenses'
          },
          {
            label: dictionary['navigation']?.giftProducts ?? 'Gifts',
            icon: 'tabler-gift',
            href: '/apps/ngoni/gifts'
          }
        ]
      }
    ]
  }
]

export default verticalMenuData
