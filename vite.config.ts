import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  resolve: {
    alias: [
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
      '/api': {
        target: 'http://116.85.69.138:8000',
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
        },
      },
    },
  },
});
