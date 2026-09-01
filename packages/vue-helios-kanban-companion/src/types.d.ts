import type { Component } from 'vue'

export const HeliosKanbanCompanion: Component

export type Editor = 'vscode' | 'vscode-insiders' | 'cursor' | string

export type PathModifier = (path: string) => string

export type Source = {
  fileName: string
  lineNumber?: number
  columnNumber?: number
}

export type VueInstance = {
  $el?: unknown
  $options: {
    name?: string
    __file?: string
    _componentTag?: string
    propsData?: Record<string, unknown>
  }
  $parent?: VueInstance | null
}
