import { type Preview } from '@storybook/react-vite'
import { initialize, mswLoader } from 'msw-storybook-addon'

import '../src/styles/index.scss'

import { handlers } from '../src/msw/handlers'
import { setMinimumResponseDelay } from '../src/msw/utils/createMockEndpoint'
import { LayerTestProvider } from '../src/test-utils/LayerTestProvider'

/*
 * Every story runs against the same MSW handler tree the unit tests use, so
 * no story ever talks to a real API. Individual stories can swap payloads via
 * `parameters.msw.handlers` using each endpoint's `.mock(...)` / `.mockError(...)`.
 */
initialize({ onUnhandledRequest: 'bypass' })

// Give every mocked endpoint a floor so loading states are visible in stories.
setMinimumResponseDelay(250)

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    msw: { handlers },
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <LayerTestProvider>
        <Story />
      </LayerTestProvider>
    ),
  ],
}

export default preview
