/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/configure',
        destination: '/',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
