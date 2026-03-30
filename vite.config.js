import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin to serve .webmanifest files with the correct MIME type
const webmanifestPlugin = () => ({
  name: 'webmanifest-mime',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url && req.url.endsWith('.webmanifest')) {
        res.setHeader('Content-Type', 'application/manifest+json');
      }
      next();
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), webmanifestPlugin()],
})
