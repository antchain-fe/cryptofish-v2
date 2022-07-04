import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  fastRefresh: {},
  // publicPath for gh-pages
  publicPath: process.env.NODE_ENV === 'production' ? '/cryptofish-v2/' : '/',
  antd: {
    dark: true,
  },
  history: {
    type: 'hash',
  },
});
