import { resolve } from 'path'

import { defineConfig } from 'vite'

import vuePlugin from '@vitejs/plugin-vue'
import tsconfig from './tsconfig.json'

const paths = tsconfig.compilerOptions.paths || {}

import ApiMockPlugin from './api-mock'

export interface Options {
  mockOptions: import('./api-mock').Options
}

export default function microSite(options: Options) {
  return defineConfig({
    resolve: {
      alias: Object.keys(paths).reduce((prev, cur) => {
        prev[cur] = resolve(paths[cur][0])
        return prev
      }, {})
    },
    optimizeDeps: {
      include: [ 'redux' ]
    },
    server: {
      fs: { 
        allow: [ '..' ]
      }
    },
    plugins: [ vuePlugin(), ApiMockPlugin(options.mockOptions) ]
  })
}