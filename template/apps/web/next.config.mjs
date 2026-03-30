/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@workspace/ui'],
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
