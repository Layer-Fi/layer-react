import * as layer from '@layerfi/components'
import type { EventCallbacks } from '@layerfi/components'
import '@layerfi/components/index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// `Object.keys` on the namespace is not statically analysable, so nothing can be tree-shaken away
// and `vite build` has to resolve every public entry's transitive imports out of the tarball. A
// hand-listed subset would drift as the API grows.
const exportCount = Object.keys(layer).length

// Rendering the data-driven components would only produce network noise. Mounting the provider is
// what exercises the runtime path; with no credentials passed, every SWR key stays null and nothing
// is fetched.
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
