/**
 * @typedef {import('./types.js').VueInstance} VueInstance
 */

/**
 * @param {VueInstance} instance
 */
export function getDisplayNameForInstance(instance) {
  const { $options } = instance

  if ($options.name) {
    return $options.name
  }

  // Tag under which the component was registered by its parent
  if ($options._componentTag) {
    return $options._componentTag
  }

  if ($options.__file) {
    const segments = $options.__file.split('/')
    return segments[segments.length - 1].replace(/\.vue$/, '')
  }

  return 'Anonymous Component'
}
