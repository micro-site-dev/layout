import { defineConfig } from 'vite'

import vuePlugin from '@vitejs/plugin-vue'
import microSite from './api-mock'

export default defineConfig({
  plugins: [ 
    vuePlugin(), 
    microSite({
      url: '/config.json'
    }) 
  ]
})