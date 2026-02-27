// Type Imports
import type { ProfileHeaderType, DataType } from '@/types/pages/profileTypes'

type DB = {
  users: DataType
  profileHeader: ProfileHeaderType
}

export const db: DB = {
  users: {
    profile: {
      about: [
        { property: 'Full Name', value: 'John Doe', icon: 'tabler-user' },
        { property: 'Status', value: 'active', icon: 'tabler-check' },
        { property: 'Role', value: 'Developer', icon: 'tabler-crown' },
        { property: 'Country', value: 'USA', icon: 'tabler-flag' },
        { property: 'Language', value: 'English', icon: 'tabler-language' }
      ],
      contacts: [
        { property: 'Contact', value: '(123) 456-7890', icon: 'tabler-phone-call' },
        { property: 'Skype', value: 'john.doe', icon: 'tabler-messages' },
        { property: 'Email', value: 'john.doe@example.com', icon: 'tabler-mail' }
      ],
      teams: [
        { property: 'Backend Developer', value: '(126 Members)' },
        { property: 'React Developer', value: '(98 Members)' }
      ],
      overview: [
        { property: 'Task Compiled', value: '13.5k', icon: 'tabler-check' },
        { property: 'Connections', value: '897', icon: 'tabler-users' },
        { property: 'Projects Compiled', value: '146', icon: 'tabler-layout-grid' }
      ],
      connections: [
        { isFriend: true, connections: '45', name: 'Cecilia Payne', avatar: '/images/avatars/2.png' },
        { isFriend: false, connections: '1.32k', name: 'Curtis Fletcher', avatar: '/images/avatars/3.png' },
        { isFriend: false, connections: '125', name: 'Alice Stone', avatar: '/images/avatars/4.png' },
        { isFriend: true, connections: '456', name: 'Darrell Barnes', avatar: '/images/avatars/5.png' },
        { isFriend: true, connections: '1.2k', name: 'Eugenia Moore', avatar: '/images/avatars/8.png' }
      ],
      teamsTech: [
        { members: 72, ChipColor: 'error', chipText: 'Developer', title: 'React Developers', avatar: '/images/logos/react-bg.png' },
        { members: 122, chipText: 'Support', ChipColor: 'primary', title: 'Support Team', avatar: '/images/icons/support-bg.png' },
        { members: 7, ChipColor: 'info', chipText: 'Designer', title: 'UI Designer', avatar: '/images/logos/figma-bg.png' },
        { members: 289, ChipColor: 'error', chipText: 'Developer', title: 'Vue.js Developers', avatar: '/images/logos/vue-bg.png' },
        { members: 24, chipText: 'Marketing', ChipColor: 'secondary', title: 'Digital Marketing', avatar: '/images/logos/twitter-bg.png' }
      ],
      projectTable: [
        { id: 1, title: 'BGC eCommerce App', subtitle: 'React Project', leader: 'Eileen', avatar: '/images/logos/react-bg.png', avatarGroup: ['/images/avatars/1.png', '/images/avatars/2.png', '/images/avatars/3.png', '/images/avatars/4.png'], status: 78 },
        { id: 2, leader: 'Owen', title: 'Falcon Logo Design', subtitle: 'Figma Project', avatar: '/images/logos/figma-bg.png', avatarGroup: ['/images/avatars/5.png', '/images/avatars/6.png'], status: 18 },
        { id: 3, title: 'Dashboard Design', subtitle: 'VueJs Project', leader: 'Keith', avatar: '/images/logos/vue-bg.png', avatarGroup: ['/images/avatars/7.png', '/images/avatars/8.png', '/images/avatars/1.png', '/images/avatars/2.png'], status: 62 }
      ]
    },
    teams: [
      { extraMembers: 9, title: 'React Developers', avatar: '/images/logos/react-bg.png', avatarGroup: [{ avatar: '/images/avatars/1.png', name: 'Vinnie Mostowy' }, { avatar: '/images/avatars/2.png', name: 'Allen Rieske' }, { avatar: '/images/avatars/3.png', name: 'Julee Rossignol' }], description: "We don't make assumptions about the rest of your technology stack.", chips: [{ title: 'React', color: 'primary' }, { title: 'MUI', color: 'info' }] },
      { extraMembers: 4, title: 'Vue.js Dev Team', avatar: '/images/logos/vue-bg.png', avatarGroup: [{ avatar: '/images/avatars/5.png', name: "Kaith D'souza" }, { avatar: '/images/avatars/6.png', name: 'John Doe' }, { avatar: '/images/avatars/7.png', name: 'Alan Walker' }], description: 'The development of Vue and its ecosystem is guided by an international team.', chips: [{ title: 'Vuejs', color: 'success' }, { color: 'error', title: 'Developer' }] }
    ],
    projects: [
      { daysLeft: 28, comments: 15, totalTask: 344, hours: '380/244', tasks: '290/344', budget: '$18.2k', completedTask: 328, deadline: '28/2/22', chipColor: 'success', startDate: '14/2/21', budgetSpent: '$24.8k', members: '280 members', title: 'Social Banners', client: 'Christian Jimenez', avatar: '/images/icons/social-bg.png', description: 'We are Consulting, Software Development and Web Development Services.', avatarGroup: [{ avatar: '/images/avatars/1.png', name: 'Vinnie Mostowy' }, { avatar: '/images/avatars/2.png', name: 'Allen Rieske' }, { avatar: '/images/avatars/3.png', name: 'Julee Rossignol' }] },
      { daysLeft: 15, comments: 236, totalTask: 90, tasks: '12/90', hours: '98/135', budget: '$1.8k', completedTask: 38, deadline: '21/6/22', budgetSpent: '$2.4k', chipColor: 'warning', startDate: '18/8/21', members: '1.1k members', title: 'Admin Template', client: 'Jeffrey Phillips', avatar: '/images/logos/react-bg.png', avatarGroup: [{ avatar: '/images/avatars/4.png', name: "Kaith D'souza" }, { avatar: '/images/avatars/5.png', name: 'John Doe' }, { avatar: '/images/avatars/6.png', name: 'Alan Walker' }], description: "Time is our most valuable asset." }
    ],
    connections: [
      { tasks: '834', projects: '18', isConnected: true, connections: '129', name: 'Mark Gilbert', designation: 'UI Designer', avatar: '/images/avatars/1.png', chips: [{ title: 'Figma', color: 'secondary' }, { title: 'Sketch', color: 'warning' }] },
      { tasks: '2.31k', projects: '112', isConnected: false, connections: '1.28k', name: 'Eugenia Parsons', designation: 'Developer', avatar: '/images/avatars/2.png', chips: [{ color: 'error', title: 'Angular' }, { color: 'info', title: 'React' }] },
      { tasks: '1.25k', projects: '32', isConnected: false, connections: '890', name: 'Francis Byrd', designation: 'Developer', avatar: '/images/avatars/3.png', chips: [{ title: 'HTML', color: 'primary' }, { color: 'info', title: 'React' }] }
    ]
  },
  profileHeader: {
    fullName: 'John Doe',
    location: 'Vatican City',
    joiningDate: 'April 2021',
    designation: 'UX Designer',
    profileImg: '/images/avatars/1.png',
    designationIcon: 'tabler-palette',
    coverImg: '/images/pages/profile-banner.png'
  }
}
