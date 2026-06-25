/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    // sql.js references node core modules that don't exist in the browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
};

export default nextConfig;
