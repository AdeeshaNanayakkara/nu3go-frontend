import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://13.201.222.82:80";
let backendHostname = "13.201.222.82";
let backendProtocol: "http" | "https" = "http";
try {
  const parsed = new URL(backendUrl);
  backendHostname = parsed.hostname;
  backendProtocol = (parsed.protocol.replace(":", "") as "http" | "https") || "http";
} catch {
  // fallback to default
}

const nextConfig: NextConfig = {
  images: {
    // Allow quality 95 used by the auth background image
    qualities: [75, 90, 95],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.google.com",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: backendProtocol,
        hostname: backendHostname,
      },
      {
        protocol: "http",
        hostname: "13.201.222.82",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
