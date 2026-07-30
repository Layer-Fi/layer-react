/// <reference types="vite/client" />
import { type Preview } from '@storybook/react-vite'
import { initialize, mswLoader } from 'msw-storybook-addon'

import '../src/styles/index.scss'

import { handlers } from '../src/msw/handlers'
import { setMinimumResponseDelay } from '../src/msw/utils/createMockEndpoint'
import { resetMockStores } from '../src/msw/utils/createMockStore'
import { installMockedSystemDate } from './mocks/systemDate'
import { StorybookLayerProvider, usesRealBackend } from './StorybookLayerProvider'

if (!usesRealBackend) {
  installMockedSystemDate()

  initialize({
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    onUnhandledRequest: (request, print) => {
      if (new URL(request.url).hostname.endsWith('layerfi.com')) print.error()
    },
  })

  setMinimumResponseDelay(250)
}

const preview: Preview = {
  loaders: usesRealBackend ? [] : [() => resetMockStores(), mswLoader],
  parameters: {
    msw: { handlers },
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <StorybookLayerProvider>
        <Story />
      </StorybookLayerProvider>
    ),
  ],
}

export default preview
