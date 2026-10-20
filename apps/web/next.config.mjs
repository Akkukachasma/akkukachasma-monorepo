/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allow production build to succeed even with type errors
    ignoreBuildErrors: true,
  },

  images: {
    /**
     * Next.js resolves remote image hostnames on the server and blocks “private” IPs (SSRF).
     * Some networks/DNS (incl. NAT64) return IPv6 under `64:ff9b::/96` for public names like
     * `s3.*.amazonaws.com`, which gets misclassified — logs show “resolved to private ip” and
     * `/_next/image` returns 400. Allowed hostnames are still limited by `remotePatterns`.
     */
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      // S3 path-style (s3.<region>.amazonaws.com/<bucket>/...) and virtual-hosted
      // (<bucket>.s3.<region>.amazonaws.com/...). A single region hostname is not enough.
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.akkukachasma.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      // Local API / proxied assets in development
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
      // India server
      {
        protocol: "http",
        hostname: "210.79.129.189",
        pathname: "/**",
      },
      // Current VPS server
      {
        protocol: "http",
        hostname: "31.42.125.213",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "31.42.125.213",
        port: "8001",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
