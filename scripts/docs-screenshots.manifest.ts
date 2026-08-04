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
  /**
   * Width to run the story's interaction at, when it differs from the capture width — the
   * Invoices detail view is only reachable from the narrow layout's clickable rows, but reads
   * clipped below desktop. Navigate narrow, screenshot wide.
   */
  interactAt?: DocsScreenshotViewport
  /** The .mdx page that renders this image. Reported in the PR body; never edited. */
  page: string
}

// Doc pages with no story to shoot yet, so their images stay hand-managed:
//   components/balance-sheet, components/cash-flow-statement, components/pnl-table.
// (pages/reports is deprecated and intentionally skipped.)
// Add the story, then add the entry here — check-docs-screenshots enforces that every
// story tagged `docs-screenshot` appears below, and vice versa.
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
    storyId: 'blocks-datepickers-globaldaterangeselection--default',
    out: 'components/global-date-range-selection.png',
    viewport: 'tablet',
    page: 'embedded-components/components/global-date-range-selection.mdx',
  },
  {
    storyId: 'blocks-datepickers-globalmonthpicker--default',
    out: 'components/global-month-picker.png',
    viewport: 'tablet',
    page: 'embedded-components/components/global-month-picker.mdx',
  },
  {
    storyId: 'views-invoices--default',
    out: 'components/invoices.png',
    viewport: 'desktop',
    page: 'embedded-components/components/invoices.mdx',
  },
  {
    storyId: 'components-journal--default',
    out: 'components/journal.png',
    viewport: 'desktop',
    page: 'embedded-components/components/journal.mdx',
  },
  {
    storyId: 'views-landingpage--default',
    out: 'components/landing-page.png',
    viewport: 'desktop',
    page: 'embedded-components/components/landing-page.mdx',
  },
  {
    storyId: 'components-linkaccounts--default',
    out: 'components/link-accounts.png',
    viewport: 'desktop',
    page: 'embedded-components/components/link-accounts.mdx',
  },
  {
    storyId: 'components-linkedaccounts--default',
    out: 'components/linked-accounts.png',
    viewport: 'desktop',
    page: 'embedded-components/components/linked-accounts.mdx',
  },
  {
    storyId: 'components-profitandloss-detailedcharts--revenue',
    out: 'components/pnl-breakdown-charts.png',
    viewport: 'desktop',
    page: 'embedded-components/components/pnl-breakdown-charts.mdx',
  },
  {
    storyId: 'components-profitandloss-summaries--profit-and-loss',
    out: 'components/pnl-cards.png',
    viewport: 'desktop',
    page: 'embedded-components/components/pnl-cards.mdx',
  },
  {
    storyId: 'components-profitandloss-chart--default',
    out: 'components/pnl-chart.png',
    viewport: 'desktop',
    page: 'embedded-components/components/pnl-chart.mdx',
  },
  {
    storyId: 'components-tasks--default',
    out: 'components/tasks.png',
    viewport: 'desktop',
    page: 'embedded-components/components/tasks.mdx',
  },
  {
    storyId: 'views-overview-accounting--default',
    out: 'pages/accounting-overview.png',
    viewport: 'desktop',
    page: 'embedded-components/pages/accounting-overview.mdx',
  },
  {
    storyId: 'views-banktransactions-withlinkedaccounts--bookkeeping-enabled',
    out: 'pages/bank-transactions-with-linked-accounts.png',
    viewport: 'desktop',
    page: 'embedded-components/pages/bank-transactions-with-linked-accounts.mdx',
  },
  {
    storyId: 'views-overview-bookkeeping--default',
    out: 'pages/bookkeeping-overview.png',
    viewport: 'desktop',
    page: 'embedded-components/pages/bookkeeping-overview.mdx',
  },
  {
    storyId: 'views-generalledger--default',
    out: 'pages/general-ledger-view.png',
    viewport: 'desktop',
    page: 'embedded-components/pages/general-ledger-view.mdx',
  },
  {
    storyId: 'views-mileagetracking--default',
    out: 'pages/mileage-tracking.png',
    viewport: 'desktop',
    page: 'embedded-components/pages/mileage-tracking.mdx',
  },
  {
    storyId: 'views-taxestimates--default',
    out: 'pages/tax-estimates.png',
    viewport: 'desktop',
    page: 'embedded-components/pages/tax-estimates.mdx',
  },
  {
    storyId: 'components-journal--drawer-open',
    out: 'components/journal-sidebar.png',
    viewport: 'desktop',
    page: 'embedded-components/components/journal.mdx',
  },
  {
    storyId: 'views-invoices--detail',
    out: 'components/invoice-detail.png',
    viewport: 'desktop',
    interactAt: 'tablet',
    page: 'embedded-components/components/invoices.mdx',
  },
  {
    storyId: 'components-linkaccounts--accounts-linked',
    out: 'components/link-accounts-after-linking.png',
    viewport: 'desktop',
    page: 'embedded-components/components/link-accounts.mdx',
  },
  {
    storyId: 'components-linkaccounts--confirming-business-accounts',
    out: 'components/link-accounts-confirming.png',
    viewport: 'desktop',
    page: 'embedded-components/components/link-accounts.mdx',
  },
  {
    storyId: 'components-unifiedreports--default',
    out: 'pages/unified-reports.png',
    viewport: 'desktop',
    page: 'embedded-components/pages/unified-reports.mdx',
  },
]
