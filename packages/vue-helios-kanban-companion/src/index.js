let Component = { name: 'HeliosKanbanCompanion', render: () => null }

if (process.env.NODE_ENV === 'development') {
  // NOTE: the wrapper must stay stateful — rendering an async component
  // inside a `functional: true` component loops forever in Vue 2 (each
  // render creates a fresh factory, whose resolution re-triggers render).
  Component = {
    name: 'HeliosKanbanCompanion',
    components: {
      AsyncHeliosKanbanCompanion: () =>
        import('./HeliosKanbanCompanion.js').then(
          (module) => module.HeliosKanbanCompanion
        ),
    },
    render: (h) => h('async-helios-kanban-companion'),
  }
}

export const HeliosKanbanCompanion = Component
