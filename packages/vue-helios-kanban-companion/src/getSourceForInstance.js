/**
 * @typedef {import('./types.js').VueInstance} VueInstance
 */

/**
 * Source location for a Vue 2 component instance.
 *
 * `vue-loader` and `vite-plugin-vue2` inject `options.__file` in development
 * builds. Vue 2 does not track line/column numbers for components, so they
 * default to 1.
 *
 * @param {VueInstance} instance
 * @returns {{ fileName: string, lineNumber: number, columnNumber: number } | undefined}
 */
export function getSourceForInstance(instance) {
  const fileName = instance.$options && instance.$options.__file

  if (!fileName) {
    return
  }

  return { columnNumber: 1, fileName, lineNumber: 1 }
}
