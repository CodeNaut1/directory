import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const ARCHIVED_INFOGRAPHICS = [
  'infographic_q4_2023.png',
  'infographic_q1_2024.png',
  'infographic_q2_2024.png',
  'infographic_q3_2024.png',
  'infographic_q4_2024.png',
  'infographic_q1_2025.png',
  'infographic_q2_2025.png',
  'infographic_q3_2025.png',
  'infographic_q4_2025.png',
  'infographic_q1_2026.png',
  'infographic_q2_2026.png',
  'African Bitcoin Ecosystem Infographic Q1 2026.png',
  'African Bitcoin Ecosystem Infographic Q2 2026.png',
];

function infographicAssetRedirects(): Plugin {
  const redirectMiddleware = (
    req: { url?: string },
    res: { writeHead: (status: number, headers: Record<string, string>) => void; end: () => void },
    next: () => void
  ) => {
    const rawUrl = req.url?.split('?')[0] ?? '';
    let pathname: string;

    try {
      pathname = decodeURIComponent(rawUrl);
    } catch {
      next();
      return;
    }

    if (pathname.includes('/assets/archives/')) {
      next();
      return;
    }

    for (const filename of ARCHIVED_INFOGRAPHICS) {
      const legacyPaths = [
        `/src/assets/${filename}`,
        `/assets/${filename}`,
      ];

      if (legacyPaths.includes(pathname)) {
        const destination = `/src/assets/archives/${encodeURI(filename)}`;
        res.writeHead(301, { Location: destination });
        res.end();
        return;
      }
    }

    next();
  };

  return {
    name: 'infographic-asset-redirects',
    configureServer(server) {
      server.middlewares.use(redirectMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(redirectMiddleware);
    },
  };
}

// Simple Vite config for the directory frontend
export default defineConfig({
  plugins: [react(), infographicAssetRedirects()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
