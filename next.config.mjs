import { withContentlayer } from "next-contentlayer2"

import "./env.mjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["avatars.githubusercontent.com", "images.unsplash.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  serverExternalPackages: ["@prisma/client"],
  experimental: {},
}

export default withContentlayer(nextConfig)
