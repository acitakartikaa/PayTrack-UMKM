import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          login: path.resolve(__dirname, 'login.html'),
          dashboard: path.resolve(__dirname, 'dashboard.html'),
          supplier: path.resolve(__dirname, 'supplier.html'),
          hutang: path.resolve(__dirname, 'hutang.html'),
          jadwal: path.resolve(__dirname, 'jadwal.html'),
          prioritas: path.resolve(__dirname, 'prioritas.html'),
          pembayaran: path.resolve(__dirname, 'pembayaran.html'),
          laporan: path.resolve(__dirname, 'laporan.html'),
          pengaturan: path.resolve(__dirname, 'pengaturan.html'),
        }
      }
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
