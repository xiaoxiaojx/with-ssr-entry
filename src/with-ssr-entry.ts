import * as IWebpack from 'webpack'
import { isObject, isArray, ignoreCssFiles, injectSsrEntry } from './utils'

export interface WebpackEntrypoints {
  [bundle: string]: string | string[]
}

export default function(nextConfig: Record<string, any> = {}) {
  ignoreCssFiles()

  return Object.assign({}, nextConfig, {
    webpack(config: IWebpack.Configuration, options: Record<string, any>) {
      const { isServer } = options
      if (isServer) {
        const originalEntry: any = config.entry
        if (typeof originalEntry !== 'undefined') {
          config.entry = async () => {
            const entry: WebpackEntrypoints =
              typeof originalEntry === 'function'
                ? await originalEntry()
                : originalEntry

            if (isArray(entry)) {
              return injectSsrEntry(entry)
            } else if (isObject(entry)) {
              Object.keys(entry).forEach(key => {
                const value = entry[key]
                entry[key] = injectSsrEntry(value)
              })
            }
            return entry
          }
        }
      }

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }

      return config
    }
  })
}
