import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 子路径部署时通过环境变量注入（如 /zensheetCV/），本地开发默认根路径
  base: process.env.VITE_BASE_PATH || '/',
  build: {
    rollupOptions: {
      output: {
        // 框架与编辑器大依赖独立分包：业务代码发版迭代时 vendor chunk 命中浏览器缓存；
        // html2canvas-pro / jspdf 等动态 import 的包不在此列，保持按需加载
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'vendor-react';
          }
          if (/[\\/]node_modules[\\/](@codemirror|codemirror|@uiw|@lezer|crelt|style-mod|w3c-keyname)[\\/]/.test(id)) {
            return 'vendor-codemirror';
          }
          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // 仓库根目录的设计资源（assets/icons）
      '@assets': path.resolve(__dirname, '../../assets/icons'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
});
