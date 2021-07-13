import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import { koala } from '@micro-site/shared'
import bootstrap, { BootstrapState } from './bootstrap'

const { watch, dispatch } = koala<BootstrapState>(bootstrap)

dispatch({ type: 'GET_CONFIG' })

watch(state => {
  (state?.completed)
    && createApp(App)
          .use(router(state.routes))
          .mount('#app')
})