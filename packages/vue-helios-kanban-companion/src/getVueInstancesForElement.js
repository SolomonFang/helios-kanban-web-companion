/**
 * @typedef {import('./types.js').VueInstance} VueInstance
 */

/**
 * Collect the chain of Vue 2 component instances enclosing an element.
 *
 * Vue 2 sets `el.__vue__ = vm` on every component's root element
 * (see `mountComponent` in vue/dist/vue.runtime.esm.js), so the nearest
 * ancestor with `__vue__` is the innermost component containing the element.
 * The rest of the chain is reached via `vm.$parent`.
 *
 * @param {HTMLElement} element
 * @returns {VueInstance[]}
 */
export function getVueInstancesForElement(element) {
  /** @type {Set<VueInstance>} */
  const instances = new Set()

  /** @type {HTMLElement | null} */
  let el = element
  /** @type {VueInstance | null | undefined} */
  let vm = null

  while (el) {
    // @ts-expect-error - Vue 2 sets `__vue__` on component root elements
    if (el.__vue__) {
      // @ts-expect-error - Vue 2 sets `__vue__` on component root elements
      vm = el.__vue__
      break
    }
    el = el.parentElement
  }

  while (vm) {
    instances.add(vm)
    vm = vm.$parent
  }

  return Array.from(instances)
}
