import type { RouteRecordRaw } from 'vue-router'

import { createStore, Reducer, AnyAction, Store, applyMiddleware } from 'redux'
import { addToStore, Action, createRoute  } from '@micro-site/shared'

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

const service = (store: Store<BootstrapState, AnyAction>) => 
  (next: (action: Action) => void) => 
  async (action: Action) => {

    next(action)

    switch (action.type) {
      case 'GET_CONFIG': 
        const stores: Stores[] = []

        const response = await fetch('/config.json')
        const packages = await response.json()


        if (packages.stores) {
          await Promise.all(packages.stores.map(async moduleStore => {
            const store = await import(/* @vite-ignore */  moduleStore.module)
            stores.push({ 
              key: moduleStore.id, 
              store: store.default ?? globalThis[moduleStore.global]
            })
          }))  
        }

        const routes: RouteRecordRaw[] = packages?.routes?.map(pkg => {
          return createRoute(pkg, globalThis[pkg.global])
        })
  
        store.dispatch({ 
          type: 'bootstrap', 
          payload: { 
            routes, 
            stores
          }
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