import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
let backendHostname = "";
let backendProtocol: "http" | "https" = "http";
if (backendUrl) {
  try {
    const parsed = new URL(backendUrl);
    backendHostname = parsed.hostname;
    backendProtocol = (parsed.protocol.replace(":", "") as "http" | "https") || "http";
  } catch {
    // invalid URL — skip backend image pattern
  }
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://accounts.google.com",
              "frame-src https://accounts.google.com",
            ].join("; "),
          },
        ],
      },
    ];
  },

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
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(backendHostname
        ? [{ protocol: backendProtocol, hostname: backendHostname }]
        : []),
      ...(process.env.NODE_ENV !== "production"
        ? [
            { protocol: "http" as const, hostname: "localhost" },
            { protocol: "http" as const, hostname: "127.0.0.1" },
          ]
        : []),
    ],
  },
};

export default nextConfig;
