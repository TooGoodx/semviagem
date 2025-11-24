import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), '.'),
      '~': path.resolve(process.cwd(), '.'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    assetsDir: 'assets'
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.moblix.com.br',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Adiciona os cabeçalhos necessários para a API Moblix
            proxyReq.setHeader('Host', 'api.moblix.com.br');
            proxyReq.setHeader('Origin', 'externo');
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            console.log(`[PROXY] ${req.method} ${req.url}`);
            console.log(`[PROXY] Headers:`, proxyReq.getHeaders());
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // Adiciona headers CORS
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, content-type, Authorization, Origin, Referer';
            
            console.log(`[PROXY] Resposta ${proxyRes.statusCode} para ${req.method} ${req.url}`);
          });
          proxy.on('error', (err, _req, _res) => {
            console.error('Erro no proxy:', err);
          });
        }
      }
    }
  }
})
