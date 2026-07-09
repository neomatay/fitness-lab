/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 部署在子路径 /fitness-lab/ 下，生产构建需要 base
// 本地开发不带 base，保持 http://localhost:5173 干净
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/fitness-lab/' : '/',
  server: {
    port: 5173,
    host: true, // 允许手机局域网访问
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}));
