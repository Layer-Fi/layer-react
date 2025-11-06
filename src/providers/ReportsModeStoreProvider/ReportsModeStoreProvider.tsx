import { useState, createContext, type PropsWithChildren, useContext } from 'react'
import { createStore, useStore } from 'zustand'
import type { DatePickerMode, DateRangePickerMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'

export enum ReportKey {
  ProfitAndLoss = 'ProfitAndLoss',
  BalanceSheet = 'BalanceSheet',
  StatementOfCashFlows = 'StatementOfCashFlows',
}

export type ReportModes = {
  [ReportKey.ProfitAndLoss]: DateRangePickerMode
  [ReportKey.BalanceSheet]: DatePickerMode
  [ReportKey.StatementOfCashFlows]: DateRangePickerMode
}
type MutableReportKey = Exclude<ReportKey, ReportKey.BalanceSheet>

type ReportsModeStoreShape = {
  resetPnLModeToDefaultOnMount: boolean
  modeByReport: ReportModes
  actions: {
    setModeForReport: <K extends MutableReportKey>(report: K, mode: ReportModes[K]) => void
  }
}

const defaultModeByReport: ReportModes = {
  [ReportKey.ProfitAndLoss]: 'monthPicker',
  // This one should never change, but is included for completeness
  [ReportKey.BalanceSheet]: 'dayPicker',
  [ReportKey.StatementOfCashFlows]: 'monthPicker',
}

const ReportsModeStoreContext = createContext(
  createStore<ReportsModeStoreShape>(() => ({
    resetPnLModeToDefaultOnMount: true,
    modeByReport: {} as ReportModes,
    actions: {
      setModeForReport: () => {},
    },
  })),
)

export function useReportModeStore() {
  const store = useContext(ReportsModeStoreContext)
  return useStore(store)
}

export function useReportMode<K extends ReportKey>(report: K): ReportModes[K] | undefined {
  const store = useContext(ReportsModeStoreContext)
  return useStore(store, state => state.modeByReport[report])
}

export function useReportModeActions() {
  const store = useContext(ReportsModeStoreContext)
  const setModeForReport = useStore(store, s => s.actions.setModeForReport)

  return { setModeForReport }
}

export function useReportModeWithFallback<K extends ReportKey>(
  report: K,
  fallback: ReportModes[K],
): ReportModes[K] {
  const mode = useReportMode(report)

  return mode ?? fallback
}

type ReportsModeStoreProviderProps = PropsWithChildren<{
  initialModes: Partial<ReportModes>
  resetPnLModeToDefaultOnMount?: boolean
}>

export function ReportsModeStoreProvider({
  children,
  initialModes,
  resetPnLModeToDefaultOnMount = true,
}: ReportsModeStoreProviderProps) {
  const [store] = useState(() =>
    createStore<ReportsModeStoreShape>(set => ({
      modeByReport: { ...defaultModeByReport, ...initialModes },
      resetPnLModeToDefaultOnMount,
      actions: {
        setModeForReport: (report, mode) =>
          set(state => ({
            modeByReport: {
              ...state.modeByReport,
              [report]: mode,
            },
          })),
      },
    })),
  )

  return (
    <ReportsModeStoreContext.Provider value={store}>
      {children}
    </ReportsModeStoreContext.Provider>
  )
}
