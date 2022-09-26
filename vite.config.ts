/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { defineConfig } from 'vite';
import { dependencies } from './package.json';
import reactRefresh from '@vitejs/plugin-react-refresh';
import { md } from './plugins/md';
const reactSvgPlugin = require('vite-plugin-react-svg');
import { visualizer } from 'rollup-plugin-visualizer';

const chunk2 = [
  '@codemirror/autocomplete',
  '@codemirror/highlight',
  '@codemirror/lint',
  '@codemirror/language',
  '@codemirror/state',
  '@d3-charts/ts-graph',
  '@y0c/react-datepicker',
  'better-babel-generator',
  '@codemirror/view',
  'codemirror-promql',
  '@codemirror/basic-setup',
];
const chunk3 = ['react-ace'];
const chunk1 = ['react', 'react-router-dom', 'react-dom', 'moment', '@ant-design/icons', 'umi-request', 'lodash', 'react-grid-layout', 'd3', 'ahooks', 'color'];
const antdChunk = ['antd'];

function renderChunks(deps: Record<string, string>) {
  let chunks = {};
  Object.keys(deps).forEach((key) => {
    if (chunk1.includes(key) || chunk2.includes(key) || chunk3.includes(key)) return;
    chunks[key] = [key];
  });
  return chunks;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    md(),
    reactRefresh(),
    reactSvgPlugin({ defaultExport: 'component' }),
    // visualizer()
  ],
  define: {},
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
      '/api/n9e-plus': {
        target: 'http://10.206.0.7:29001/',
        changeOrigin: true,
      },
      '/api/n9e': {
        target: 'http://10.206.0.11:9000/',
        changeOrigin: true,
      },
      '/api/v1/': {
        target: 'http://10.206.0.11:9000/',
        changeOrigin: true,
      },
      '/api/fc-brain': {
        target: 'http://10.206.0.11:9000/',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'chrome58',
    outDir: 'pub',
    chunkSizeWarningLimit: 650,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: chunk1,
          vendor1: chunk2,
          vendor2: chunk3,
          antdChunk: antdChunk,
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        additionalData: `@import "/src/global.variable.less";`,
        javascriptEnabled: true,
        modifyVars: {
          // modify-start
          // 'primary-color': '#1890ff',
          // 'font-size-base': '12px',
          // 'color-base': '#333',
          // 'form-item-margin-bottom': '18px',
          // 'font-family': 'verdana, Microsoft YaHei, Consolas, Deja Vu Sans Mono, Bitstream Vera Sans Mono',
          // 'text-color': '#333',
          // 'menu-dark-bg': '#2C3D5E',
          // 'menu-dark-inline-submenu-bg': '#2C3D5E',
          // modify-end

          // 下面是云眼的全局样式
          'primary-color': '#6C53B1',
          'disabled-color': 'rgba(0, 0, 0, 0.5)',
          'tabs-ink-bar-color': 'linear-gradient(to right, #9F4CFC, #0019F4 )',
          'font-size-base': '12px',
          'menu-item-font-size': '14px',
          'radio-button-checked-bg': '#EAE6F3',
          'form-item-margin-bottom': '18px',
          'font-family': 'PingFangSC-Regular,microsoft yahei ui,microsoft yahei,simsun,"sans-serif"',
          'text-color': '#262626',
          // 'component-background': '#f0f0f0',
          // 'modal-header-bg': '#fff',
          // 'modal-content-bg': '#fff',
          // 'modal-footer-bg': '#fff',
          // 'select-background': '#fff',
          'table-row-hover-bg': '#EAE8F2',
          'table-header-bg': '#f0f0f0',
          // 'collapse-content-bg': '#fff',
          'select-selection-item-bg': '#EAE6F3',
          'select-selection-item-border-color': '#6C53B1',
          'menu-item-color': '#8C8C8C',
          'menu-inline-submenu-bg': '#f0f0f0',
          'menu-bg': '#f0f0f0',
          'checkbox-check-bg': '#fff',
          'checkbox-check-color': '#6C53B1',
          'checkbox-color': 'fade(@checkbox-check-color, 10)',
          // 'input-bg': '#fff',
          'btn-padding-horizontal-base': '12px',
          // 'menu-inline-toplevel-item-height': '48px',
          // 'item-hover-bg': 'fade(@checkbox-check-color, 10)',
        },
      },
    },
  },
});
