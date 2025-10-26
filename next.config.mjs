// Next.js config in ESM format (supported by Next 14)
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow dev requests from specific hosts to /_next/* during development
  // to avoid cross-origin warnings when tunneling or using remote hosts.
  // Has no effect in production builds.
  allowedDevOrigins: [
    // Add your EC2 hostname/IPs here. These are examples based on the logs.
    'http://ec2-3-89-249-145.compute-1.amazonaws.com',
    'http://3.89.249.145',
  ],
};

export default nextConfig;
