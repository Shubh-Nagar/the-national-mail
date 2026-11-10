import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');

const nextConfig = {
  reactStrictMode: true,
  // The repo root has its own package.json; keep Next.js scoped to this folder.
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // Files uploaded through the admin panel are served by the API.
      { protocol: apiUrl.protocol.replace(':', ''), hostname: apiUrl.hostname, port: apiUrl.port, pathname: '/uploads/**' },
      // Images linked from elsewhere (added to the media library as external links).
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
