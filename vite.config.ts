import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import { md } from './plugins/md';
const reactSvgPlugin = require('vite-plugin-react-svg');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    md(),
    reactRefresh(),
    reactSvgPlugin({ defaultExport: 'component' }),
  ],
  define: {},
  resolve: {
    alias: [
      {
        find: '@/store/eventWallInterface',
        replacement: '/src/Packages/EventWall/interface',
      },
      {
        find: '@/services/outfire',
        replacement: '/src/Packages/Outfire/services/outfire',
      },
      {
        find: '@/pages/outfire',
        replacement: '/src/Packages/Outfire/pages',
      },
      {
        find: '@',
        replacement: '/src',
      },
    ],
    // extensions:['.js', '.ts', '.jsx', '.tsx', '.json']
  },
  server: {
    proxy: {
      // 字符串简写写法
      // '/foo': 'http://localhost:4567/foo',
      // 选项写法
      // '/api': {
      //   target: 'http://10.86.76.13:8085',
      //   changeOrigin: true,
      // },
      '/api/n9e': {
        target: 'http://118.195.188.100:8765',
        changeOrigin: true,
      },
      '/filters': {
        target: 'http://118.195.188.100:8765',
        changeOrigin: true,
      },
      '/integrations': {
        target: 'http://118.195.188.100:8765',
        changeOrigin: true,
      },
      '/alerts': {
        target: 'http://118.195.188.100:8765',
        changeOrigin: true,
      },
      '/changes': {
        target: 'http://118.195.188.100:8765',
        changeOrigin: true,
      },
      '/dimension/api/v1': {
        target: 'http://10.166.53.215:8089',
        changeOrigin: true,
      },
      '/v1/api/fireplate': {
        target: 'http://172.20.70.60:8010',
        changeOrigin: true,
      },
      // 正则表达式写法
      // '^/fallback/.*': {
      //   target: 'http://jsonplaceholder.typicode.com',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/fallback/, '')
      // }
    },
  },
  build: {
    outDir: 'pub',
    chunkSizeWarningLimit: 3000
  },
  css: {
    preprocessorOptions: {
      less: {
        additionalData: `@import "/src/global.variable.less";`,
        javascriptEnabled: true,
        modifyVars: {
          'font-size-base': '12px',
          'color-base': '#333',
          'form-item-margin-bottom': '18px',
          'font-family':
            'verdana, Microsoft YaHei, Consolas, Deja Vu Sans Mono, Bitstream Vera Sans Mono',
          'text-color': '#333',
          'menu-dark-bg': '#2C3D5E',
          'menu-dark-inline-submenu-bg': '#2C3D5E',
        },
      },
    },
  },
});
