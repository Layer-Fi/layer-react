/// <reference types="vite/client" />
import { type Preview } from '@storybook/react-vite'
import { setupWorker } from 'msw/browser'
import { mswLoader } from 'msw-storybook-addon/csf3'

import '../src/styles/index.scss'

import { handlers } from '../src/msw/handlers'
import { setMinimumResponseDelay } from '../src/msw/utils/createMockEndpoint'
import { resetMockStores } from '../src/msw/utils/createMockStore'
import { setDateRangePinning } from '../src/testUtils/storybook/decorators/PinnedGlobalDateRange'
import { BREAKPOINTS } from '../src/utils/shared/size/screenSizeBreakpoints'
import { installSystemDateMock } from './mocks/systemDate'
import { usesRealBackend } from './realBackend'
import { StorybookLayerProvider } from './StorybookLayerProvider'
import { DOCS_SCREENSHOT_TAG } from './tags'

// Responsiveness is JS-driven off window.innerWidth (see useSizeClass), so Chromatic
// must resize the capture iframe to exercise each size class. Widths sit just below the
// mobile/tablet breakpoints and comfortably above them for desktop.
const SIZE_CLASS_VIEWPORTS = [BREAKPOINTS.MOBILE - 1, BREAKPOINTS.TABLET - 1, 1280]

// Mocked responses resolve instantly, so a floor keeps loading states visible instead of flashing.
// Every story keeps it except the ones backing docs images, which have to settle deterministically
// — driven by the tag rather than per-story parameters so a `public-api` story can't quietly lose
// its loading states just because it also feeds a screenshot.
const DEFAULT_RESPONSE_DELAY = 250

// A shifted `now`, or a range pinned to the fixture year, would query periods the real business has
// no data for.
setDateRangePinning(!usesRealBackend)

// The addon calls this once, on the first story it loads.
const startMockServiceWorker = async () => {
  const worker = setupWorker()

  await worker.start({
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    onUnhandledRequest: (request, print) => {
      // Fail loudly on unmocked API calls; assets and Storybook's own requests pass through.
      if (new URL(request.url).hostname.endsWith('layerfi.com')) print.error()
    },
  })

  return worker
}

if (!usesRealBackend) {
  installSystemDateMock()

  setMinimumResponseDelay(DEFAULT_RESPONSE_DELAY)
}

const preview: Preview = {
  // No `toolbar`: `manager.ts` contributes a free-text field and keys off this being declared.
  globalTypes: usesRealBackend ? { business: { description: 'Layer business backing every story' } } : {},
  // msw-storybook-addon's exports map declares no `./csf3` subpath, so it resolves untyped.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  loaders: usesRealBackend ? [] : [() => resetMockStores(), mswLoader(startMockServiceWorker)],
  beforeEach: ({ tags }: { tags?: string[] }) => {
    setMinimumResponseDelay(tags?.includes(DOCS_SCREENSHOT_TAG) ? 0 : DEFAULT_RESPONSE_DELAY)
    return () => setMinimumResponseDelay(DEFAULT_RESPONSE_DELAY)
  },
  parameters: {
    msw: { handlers },
    layout: 'fullscreen',
    chromatic: { viewports: SIZE_CLASS_VIEWPORTS },
  },
  decorators: [
    (Story, context) => {
      // Base UI/block components render bare, so scope the design-system root class
      // (variables, font, reset) onto them. Feature stories supply their own.
      const isPrimitive = context.title?.startsWith('UI/') || context.title?.startsWith('Blocks/')
      const story = isPrimitive
        ? <div className='Layer__component'><Story /></div>
        : <Story />

      return (
        <StorybookLayerProvider businessId={context.globals.business as string | undefined}>
          {story}
        </StorybookLayerProvider>
      )
    },
  ],
}

export default preview
