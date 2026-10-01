import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Matches today's site, which loads cosmetic/trip photos straight from
    // Supabase Storage -- add other remote hosts here as they come up.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
