import { HeliosKanbanCompanion as Component } from './HeliosKanbanCompanion.js'

export const HeliosKanbanCompanion =
  process.env.NODE_ENV === 'development'
    ? Component
    : { name: 'HeliosKanbanCompanion', render: () => null }
