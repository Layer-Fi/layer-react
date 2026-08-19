import { type ComponentProps, type PropsWithChildren } from 'react'
import { waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { type ReportConfig } from '@schemas/features/unifiedReports/reportConfig'
import {
  UnifiedReportStoreProvider,
  useBaseUnifiedReport,
} from '@providers/features/unifiedReports/UnifiedReportStore/UnifiedReportStoreProvider'

import { defaultReportGroups } from '@fixtures/unifiedReports/reportConfig'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'
import { renderHookWithAuth } from '@testUtils/render/renderHookWithAuth'

// `renderHookWithAuth` spreads options over its own default wrapper, so this has to nest
// `LayerTestProvider` itself or auth never lands.
const renderUnifiedReportStore = (props: Partial<ComponentProps<typeof UnifiedReportStoreProvider>> = {}) =>
  renderHookWithAuth(useBaseUnifiedReport, {
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

afterEach(() => vi.restoreAllMocks())

describe('UnifiedReportStoreProvider', () => {
  it('hydrates to the server default report when no key is requested', async () => {
    const { result } = await renderUnifiedReportStore()

    await waitFor(() => expect(result.current.baseReport?.key).toBe('PROFIT_AND_LOSS'))
  })

  it('hydrates to the requested report', async () => {
    const { result } = await renderUnifiedReportStore({ defaultState: { reportKey: 'BALANCE_SHEET' } })

    await waitFor(() => expect(result.current.baseReport?.key).toBe('BALANCE_SHEET'))
  })

  it('warns and falls back to the default report when the requested key is unknown', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result } = await renderUnifiedReportStore({ defaultState: { reportKey: 'NOT_A_REPORT' } })

    await waitFor(() => expect(result.current.baseReport?.key).toBe('PROFIT_AND_LOSS'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('NOT_A_REPORT'))
  })

  it('does not re-assert the requested report over user navigation', async () => {
    const { result } = await renderUnifiedReportStore({ defaultState: { reportKey: 'BALANCE_SHEET' } })

    await waitFor(() => expect(result.current.baseReport?.key).toBe('BALANCE_SHEET'))

    result.current.setBaseReport(fixtureReport('TRIAL_BALANCE'))
    await waitFor(() => expect(result.current.baseReport?.key).toBe('TRIAL_BALANCE'))
  })
})
