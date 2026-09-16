import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

// No DOM globals exist here, so any top-level `window`/`document` access anywhere in the module
// graph throws on import — which is the failure mode that breaks Next.js consumers at build time.
const { LayerProvider } = await import('@layerfi/components')

const MARKER = 'ssr-fixture-ok'

const html = renderToString(
  createElement(
    LayerProvider,
    { businessId: '00000000-0000-0000-0000-000000000000', environment: 'staging' },
    createElement('div', null, MARKER),
  ),
)

if (!html.includes(MARKER)) {
  console.error(`Server render did not produce the expected output:\n${html}`)
  process.exit(1)
}

console.log(`Server-rendered ${html.length} chars without touching the DOM.`)
