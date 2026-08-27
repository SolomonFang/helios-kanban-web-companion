/**
 * @typedef {import('./types.js').PathModifier} PathModifier
 * @typedef {import('./types.js').Source} Source
 */

/**
 * @param {Source} source
 * @param {PathModifier} pathModifier
 */
export function getPathToSource(source, pathModifier) {
  const { columnNumber = 1, fileName, lineNumber = 1 } = source

  let path = `${fileName}:${lineNumber}:${columnNumber}`
  if (pathModifier) {
    path = pathModifier(path)
  }

  return path
}
