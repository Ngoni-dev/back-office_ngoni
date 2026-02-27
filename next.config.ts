import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/storage/**'
      }
    ]
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: false,
        locale: false
      },
      {
        source: '/:lang(en|fr|ar)/dashboards/crm',
        destination: '/:lang',
        permanent: false,
        locale: false
      },
      {
        source: '/:path((?!en|fr|ar|front-pages|images|api|favicon.ico).*)*',
        destination: '/en/:path*',
        permanent: false,
        locale: false
      }
    ]
  }
}

export default nextConfig
