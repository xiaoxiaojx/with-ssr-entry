export function isObject(obj: any) {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj)
}

export function isArray(arr: any): arr is Array<any> {
  return Array.isArray(arr)
}

export function toArray(arr: any) {
  return isArray(arr) ? arr : [arr]
}

export function injectSsrEntry(entry: any) {
  return [require.resolve('./ssr-entry.js')].concat(toArray(entry))
}

export function ignoreCssFiles() {
  if (typeof require !== 'undefined') {
    require.extensions['.scss'] = () => {}
    require.extensions['.sass'] = () => {}
    require.extensions['.less'] = () => {}
    require.extensions['.css'] = () => {}
    require.extensions['.png'] = () => {}
    require.extensions['.jpg'] = () => {}
    require.extensions['.jpeg'] = () => {}
    require.extensions['.svg'] = () => {}
    require.extensions['.svga'] = () => {}
  }
}
