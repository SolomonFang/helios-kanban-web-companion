let Component = { name: 'HeliosKanbanCompanion', render: () => null }

if (process.env.NODE_ENV === 'development') {
  Component = {
    name: 'HeliosKanbanCompanion',
    functional: true,
    render: (h) =>
      h(() =>
        import('./HeliosKanbanCompanion.js').then(
          (module) => module.HeliosKanbanCompanion
        )
      ),
  }
}

export const HeliosKanbanCompanion = Component
