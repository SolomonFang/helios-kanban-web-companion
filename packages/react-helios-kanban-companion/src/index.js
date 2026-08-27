import * as React from 'react'

let Component = () => null

if (process.env.NODE_ENV === 'development') {
  const LazyComponent = React.lazy(() =>
    import('./HeliosKanbanCompanion.js').then((module) => ({
      default: /** @type {React.ComponentType} */ (
        module.HeliosKanbanCompanion
      ),
    }))
  )

  Component = () =>
    React.createElement(
      React.Suspense,
      { fallback: null },
      React.createElement(LazyComponent)
    )
}

export const HeliosKanbanCompanion = Component
