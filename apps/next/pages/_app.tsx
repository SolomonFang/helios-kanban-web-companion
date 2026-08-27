import { HeliosKanbanCompanion } from 'react-helios-kanban-companion'
import type { AppProps } from 'next/app'

import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <HeliosKanbanCompanion />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
