import * as layer from '@layerfi/components'
import type { EventCallbacks } from '@layerfi/components'
import '@layerfi/components/index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// `Object.keys` on the namespace defeats tree-shaking, so `vite build` has to resolve every
// export's transitive imports out of the tarball.
const exportCount = Object.keys(layer).length

// No credentials, so every SWR key stays null and nothing is fetched. Rendering the data-driven
// components would only add network noise; mounting the provider is the runtime path that matters.
const eventCallbacks: EventCallbacks = {}

function App() {
  return (
    <layer.LayerProvider
      businessId='00000000-0000-0000-0000-000000000000'
      environment='staging'
      eventCallbacks={eventCallbacks}
    >
      <div data-testid='fixture-ready'>
        {exportCount}
        {' public exports resolved'}
      </div>
      <layer.GlobalMonthPicker showLabel />
    </layer.LayerProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
