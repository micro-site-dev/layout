import type { RouteRecordRaw } from 'vue-router'
import type { Plugin } from 'vue'

import { createStore, Reducer, AnyAction, Store, applyMiddleware } from 'redux'
import { addToStore, Action, createRoute, AppConfig  } from '@micro-site/shared'

export interface Menu {
  text?: string
  link?: string
}

export interface Stores {
  key?: string
  store?: Store<{}, AnyAction>
}

export interface BootstrapState {
  routes?: RouteRecordRaw[], 
  menus?: Menu[]
  stores?: Stores[]
  plugins?: Plugin[]
  completed?: boolean
}

const reducer: Reducer<BootstrapState> = (
  state: BootstrapState, 
  action: Action
) => {
  switch(action.type) {
    case 'bootstrap':
      const model = action.payload as BootstrapState

      state.routes = model.routes || []
      state.stores = model.stores || []

      state.stores.forEach(({ key, store }) => {
        addToStore(key, store)
      })

      state.completed = true
      
      return state      
    default:
      return state
  }
}

const generateStores = (
  stores: { 
    key: string, 
    module: string, 
    global?: string 
  }[] = []
) => {
  return Promise.all(stores.map(async moduleStore => {
    const store = await import(/* @vite-ignore */  moduleStore.module)
    const value: Stores = {
      key: moduleStore.key,
      store: store.default ?? globalThis[moduleStore.global]
    }
    return value
  }))  
}

const service = (store: Store<BootstrapState, AnyAction>) => 
  (next: (action: Action) => void) => 
  async (action: Action) => {

    next(action)

    switch (action.type) {
      case 'GET_CONFIG': 
        const response = await fetch('/config.json')
        const packages: AppConfig = await response.json()

        const stores = await generateStores(packages.stores)

        const routes = await Promise.all(packages.routes?.map(pkg => {
          return createRoute({ route: pkg, globalPath: globalThis[pkg.global] })
        }))

        store.dispatch({ 
          type: 'bootstrap', 
          payload: { routes, stores }
        })
    }
}

const store = createStore(
  reducer, 
  {
    routes: [],
    completed: false
  }, 
  applyMiddleware(service)
)

export default store