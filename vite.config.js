import path from 'path'
import { defineConfig,loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { wrapperEnv } from './build/utils'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd())
  const viteEnv = wrapperEnv(env)
  // 这样就可以拿到定义好的环境变量了，也可以使用process.env.xxx这种方式进行访问
  const { VITE_TITLE, VITE_PUBLIC_PATH, VITE_PROXY_TARGET } = viteEnv
  return {
    plugins: [vue()],
    base: VITE_PUBLIC_PATH || '/',
    resolve: {
      //设置别名
      alias:{
        '@':path.resolve(__dirname,'./src'),
        '~': path.resolve(process.cwd()),
      }
    },
    server: {
      host: '0.0.0.0',
      port: 3200,
      open: false,
      proxy: {
        '/api': {
          target: VITE_PROXY_TARGET,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp('^/api'), ''),
          secure: false,
          configure: (proxy, options) => {
            // 配置此项可在响应头中看到请求的真实地址
            proxy.on('proxyRes', (proxyRes, req) => {
              proxyRes.headers['x-real-url'] = new URL(req.url || '', options.target)?.href || ''
            })
          },
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1024, // chunk 大小警告的限制（单位kb）
    },
  }
})
