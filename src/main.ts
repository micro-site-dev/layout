import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { koala } from '@micro-site/shared'

import bootstrap, { BootstrapState } from './bootstrap'
import App from './App.vue'

const { watch, dispatch } = koala<BootstrapState>(bootstrap)

dispatch({ type: 'GET_CONFIG' })

watch(state => {
  (state?.completed)
    && createApp(App)
          .use(createRouter({ 
            history: createWebHistory(), 
            routes: state.routes
          }))
          .mount('#app')
})