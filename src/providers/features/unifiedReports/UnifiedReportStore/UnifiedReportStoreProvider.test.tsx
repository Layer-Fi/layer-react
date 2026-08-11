import { type PropsWithChildren } from 'react'
import { act, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ReportingBasis } from '@schemas/features/business/accountingConfiguration'
import { type TagDimension } from '@schemas/features/tags/tagDimension'
import { type ReportConfig, ReportControl, type ReportGroup } from '@schemas/features/unifiedReports/reportConfig'
import {
  UnifiedReportStoreProvider,
  useBaseUnifiedReport,
  useUnifiedReportReportingBasisParam,
  useUnifiedReportTagSelection,
} from '@providers/features/unifiedReports/UnifiedReportStore/UnifiedReportStoreProvider'

import { makeTagValueDefinition } from '@fixtures/tagDimensions/mocks'
import { defaultReportGroups } from '@fixtures/unifiedReports/reportConfig'
import { get as getReportConfig } from '@msw/api/businesses/[business-id]/reports/config/get'
import { server } from '@msw/node'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'
import { renderHookWithAuth } from '@testUtils/render/renderHookWithAuth'

const useUnifiedReportStoreForTest = () => ({
  ...useBaseUnifiedReport(),
  ...useUnifiedReportReportingBasisParam(),
  ...useUnifiedReportTagSelection(),
})

// `renderHookWithAuth` spreads options over its own default wrapper, so this has to nest
// `LayerTestProvider` itself or auth never lands.
const renderWithReportStore = (props?: { defaultReportKey?: string }) =>
  renderHookWithAuth(useUnifiedReportStoreForTest, {
    wrapper: ({ children }: PropsWithChildren) => (
      <LayerTestProvider>
        <UnifiedReportStoreProvider {...props}>{children}</UnifiedReportStoreProvider>
      </LayerTestProvider>
    ),
  })

const fixtureReport = (key: string): ReportConfig => {
  const report = defaultReportGroups.flatMap(({ reports }) => reports).find(report => report.key === key)
  if (!report) throw new Error(`Missing fixture report: ${key}`)
  return report
}

const TAG_DIMENSION: TagDimension = {
  id: '00000000-0000-4000-8000-000000000401',
  key: 'job',
  displayName: 'Job',
  strictness: 'NON_BALANCING',
  definedValues: [],
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  userVisible: true,
}

const INITIAL_TAG_VALUE = makeTagValueDefinition({
  id: '00000000-0000-4000-8000-000000000411',
  key: 'job',
  value: 'smith-kitchen-remodel',
  displayName: 'Smith – Kitchen Remodel',
})

// The shared fixtures carry no reporting basis or tags, so the store's initial values would pass
// the assertions below either way; this config makes `setBaseReport`'s coupled resets observable.
const CONFIG_WITH_CONTROLS: readonly ReportGroup[] = [
  {
    groupType: 'accounting',
    displayName: 'Accounting',
    reports: [
      {
        key: 'PROFIT_AND_LOSS',
        reportRoute: 'profit-and-loss',
        displayName: 'Profit & Loss',
        controls: [ReportControl.DateRange, ReportControl.ReportingBasis],
        baseQueryParameters: {},
        isDefaultReport: true,
      },
      {
        key: 'BALANCE_SHEET',
        reportRoute: 'balance-sheet',
        displayName: 'Balance Sheet',
        controls: [ReportControl.Date, ReportControl.ReportingBasis],
        baseQueryParameters: { reporting_basis: ReportingBasis.Cash },
        tagControl: { tagDimension: TAG_DIMENSION, initialSelectedTags: [INITIAL_TAG_VALUE] },
      },
    ],
  },
]

afterEach(() => vi.restoreAllMocks())

describe('UnifiedReportStoreProvider', () => {
  it('hydrates to the server default report when no key is requested', async () => {
    const { result } = await renderWithReportStore()

    await waitFor(() => expect(result.current.baseReport?.key).toBe('PROFIT_AND_LOSS'))
  })

  it('hydrates to the requested report and initializes its controls', async () => {
    server.use(getReportConfig.mock(CONFIG_WITH_CONTROLS))

    const { result } = await renderWithReportStore({ defaultReportKey: 'BALANCE_SHEET' })

    await waitFor(() => expect(result.current.baseReport?.key).toBe('BALANCE_SHEET'))
    expect(result.current.reportingBasis).toBe(ReportingBasis.Cash)
    expect(result.current.selectedTagValues).toEqual([INITIAL_TAG_VALUE])
  })

  it('warns and falls back to the default report when the requested key is unknown', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result } = await renderWithReportStore({ defaultReportKey: 'NOT_A_REPORT' })

    await waitFor(() => expect(result.current.baseReport?.key).toBe('PROFIT_AND_LOSS'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('NOT_A_REPORT'))
  })

  it('does not re-assert the requested report over user navigation', async () => {
    const { result, rerender } = await renderWithReportStore({ defaultReportKey: 'BALANCE_SHEET' })

    await waitFor(() => expect(result.current.baseReport?.key).toBe('BALANCE_SHEET'))

    act(() => result.current.setBaseReport(fixtureReport('TRIAL_BALANCE')))
    expect(result.current.baseReport?.key).toBe('TRIAL_BALANCE')

    rerender()
    expect(result.current.baseReport?.key).toBe('TRIAL_BALANCE')
  })
})
