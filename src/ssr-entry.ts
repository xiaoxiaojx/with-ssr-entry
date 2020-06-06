if (
  typeof window === 'undefined' &&
  typeof __non_webpack_require__ !== 'undefined' &&
  __non_webpack_require__.extensions
) {
  __non_webpack_require__.extensions['.scss'] = () => {}
  __non_webpack_require__.extensions['.sass'] = () => {}
  __non_webpack_require__.extensions['.less'] = () => {}
  __non_webpack_require__.extensions['.css'] = () => {}
}
