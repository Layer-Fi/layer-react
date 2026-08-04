import { BREAKPOINTS } from '../src/utils/screenSizeBreakpoints'

// Widths mirror .storybook/preview.tsx: size class is computed from window.innerWidth,
// so the capture has to use a real viewport.
export const DOCS_SCREENSHOT_WIDTHS = {
  mobile: BREAKPOINTS.MOBILE - 1,
  tablet: BREAKPOINTS.TABLET - 1,
  desktop: 1280,
} as const

export type DocsScreenshotViewport = keyof typeof DOCS_SCREENSHOT_WIDTHS

export type DocsScreenshot = {
  /** Storybook story id, as it appears in storybook-static/index.json. */
  storyId: string
  /** Path under api-documentation/images/. */
  out: string
  viewport: DocsScreenshotViewport
  /** The .mdx page that renders this image. Reported in the PR body; never edited. */
  page: string
}

export const DOCS_SCREENSHOTS: ReadonlyArray<DocsScreenshot> = [
  {
    storyId: 'components-banktransactions--bookkeeping-enabled',
    out: 'components/bank-transactions.png',
    viewport: 'desktop',
    page: 'embedded-components/components/bank-transactions.mdx',
  },
  {
    storyId: 'components-chartofaccounts--default',
    out: 'components/chart-of-accounts.png',
    viewport: 'desktop',
    page: 'embedded-components/components/chart-of-accounts.mdx',
  },
  {
    storyId: 'components-linkedaccounts--default',
    out: 'components/linked-accounts.png',
    viewport: 'desktop',
    page: 'embedded-components/components/linked-accounts.mdx',
  },
  {
    storyId: 'components-profitandloss-chart--default',
    out: 'components/pnl-chart.png',
    viewport: 'desktop',
    page: 'embedded-components/components/pnl-chart.mdx',
  },
  {
    storyId: 'views-generalledger--default',
    out: 'components/general-ledger-view.png',
    viewport: 'desktop',
    page: 'embedded-components/pages/general-ledger-view.mdx',
  },
]
