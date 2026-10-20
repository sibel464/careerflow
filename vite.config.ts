import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Runs api/weather.ts locally, so `npm run dev` gets MGM weather without deploying. */
const localWeatherApi = (): Plugin => ({
  name: 'local-weather-api',
  configureServer(server) {
    server.middlewares.use('/api/weather', async (req, res) => {
      try {
        const mod = await server.ssrLoadModule('/api/weather.ts')
        const response: Response = await mod.GET(new Request(`http://localhost${req.originalUrl ?? req.url ?? ''}`))
        res.statusCode = response.status
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(await response.text())
      } catch {
        res.statusCode = 502
        res.end('{"error":"mgm_unavailable"}')
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localWeatherApi()],
  // The Supabase integration on Vercel provides the public URL/key under this prefix.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_SUPABASE_'],
  // `npm run dev` has no other serverless functions, so the rest of /api (sign-up) goes to the live site.
  server: { proxy: { '/api': { target: 'https://sibilia-psi.vercel.app', changeOrigin: true } } },
})
