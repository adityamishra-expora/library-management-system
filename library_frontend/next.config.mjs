/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for the Docker standalone build (node server.js)
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },
  // Proxy API calls in development to avoid CORS issues
  // Only add rewrite if the API URL is actually defined
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return [];
    return [
      {
        source: '/api/backend/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
