/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... 其他配置
  async rewrites() {
    return [
      {
        source: '/data/:path*',
        destination: '/api/download/:path*',
      },
    ];
  },
}

module.exports = nextConfig 