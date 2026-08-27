/**
 * @typedef {import('./types.js').VueInstance} VueInstance
 */

/**
 * Scalar props received by a Vue 2 component instance.
 *
 * @param {VueInstance} instance
 */
export function getPropsForInstance(instance) {
  /** @type {Record<string, unknown>} */
  const props = {}

  const propsData = (instance.$options && instance.$options.propsData) || {}

  Object.entries(propsData).forEach(([key, value]) => {
    const type = typeof value

    if (
      ['string', 'number', 'boolean', 'symbol'].includes(type) ||
      value instanceof String ||
      value instanceof Number ||
      value instanceof Boolean
    ) {
      props[key] = value
    }
  })

  return props
}
