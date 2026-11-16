import { createFileRoute } from '@tanstack/react-router'

const manifest = {
  name: 'VJEMMA',
  short_name: 'VJEMMA',
  description: 'VJEMMA - Watch movies, series and entertainment',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#000000',
  theme_color: '#000000',
  icons: [
    {
      src: '/favicon.ico',
      sizes: '48x48',
      type: 'image/x-icon',
      purpose: 'any',
    },
    {
      src: '/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
  ],
}

export const Route = createFileRoute('/manifest[.]json')({
  server: {
    handlers: {
      GET: () => {
        return new Response(JSON.stringify(manifest, null, 2), {
          headers: {
            'Content-Type': 'application/manifest+json',
            'Cache-Control': 'public, max-age=0, must-revalidate',
          },
        })
      },
    },
  },
  component: () => null,
})
