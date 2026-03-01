type SearchData = {
  id: string
  name: string
  url: string
  excludeLang?: boolean
  icon: string
  section: string
  shortcut?: string
}

const data: SearchData[] = [
  {
    id: '1',
    name: 'Dashboard Ngoni',
    url: '/',
    icon: 'tabler-chart-pie-2',
    section: 'Dashboards'
  },
  {
    id: '2',
    name: 'Music',
    url: '/apps/ngoni/music',
    icon: 'tabler-music',
    section: 'Ngoni'
  },
  {
    id: '3',
    name: 'Artists',
    url: '/apps/ngoni/artists',
    icon: 'tabler-microphone-2',
    section: 'Ngoni'
  },
  {
    id: '4',
    name: 'Genres',
    url: '/apps/ngoni/genres',
    icon: 'tabler-category',
    section: 'Ngoni'
  },
  {
    id: '5',
    name: 'Licenses',
    url: '/apps/ngoni/licenses',
    icon: 'tabler-license',
    section: 'Ngoni'
  },
  {
    id: '6',
    name: 'Gift Products',
    url: '/apps/ngoni/gift-products',
    icon: 'tabler-gift',
    section: 'Ngoni'
  },
  {
    id: '7',
    name: 'Gifts',
    url: '/apps/ngoni/gifts',
    icon: 'tabler-gift',
    section: 'Ngoni'
  },
  {
    id: '8',
    name: 'Page Not Found - 404',
    url: '/pages/misc/404-not-found',
    icon: 'tabler-info-circle',
    section: 'Pages'
  },
  {
    id: '9',
    name: 'Not Authorized - 401',
    url: '/pages/misc/401-not-authorized',
    icon: 'tabler-user-cancel',
    section: 'Pages'
  }
]

export default data
