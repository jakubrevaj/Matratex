import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignoruje ESLint chyby pri buildovaní
  },
  typescript: {
    ignoreBuildErrors: true, // Ignoruje TypeScript chyby pri buildovaní
  },
};

export default nextConfig;
