import { Response, Request, NextFunction } from 'express'
import { resolve } from 'path'
import { Plugin } from 'vite'

export interface Route {
  path: string
  component: string
  children?: Route[]
}

export interface Store {
  id: string
  module: string
}

export interface Options {
  url: string
  routes?: Route[]
  stores?: Store[]
}

import tsconfig from './tsconfig.json'

const paths = tsconfig?.compilerOptions?.paths || {}

const microSite = (options: Options) => {
  const plugin: Plugin = {
    name: 'vite:mock',
    enforce: 'pre',
    config() {
      return {
        resolve: {
          alias: Object.keys(paths).reduce((prev, cur) => {
            prev[cur] = resolve(paths[cur][0])
            return prev
          }, {})
        },
        optimizeDeps: { include: [ 'redux' ] },
        server: {
          fs: { allow: [ '..' ] }
        }
      }
    },
    configureServer({ middlewares }) {
      const middleware = async (req: Request, res: Response, next: NextFunction) => {
        if (req.url.includes(options.url)) {
          return res.end(JSON.stringify(options))
        }
        next()
      }     
      middlewares.use(middleware)
    }
  }
  return plugin
}

export default microSite