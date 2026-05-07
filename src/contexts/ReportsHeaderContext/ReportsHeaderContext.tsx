import { createContext, type Dispatch, type PropsWithChildren, type SetStateAction, useContext } from 'react'

export type ReportType = 'profitAndLoss' | 'balanceSheet' | 'statementOfCashFlow'
export type ReportOption = { value: ReportType, label: string }

export interface ReportsHeaderContextValue {
  enabledReports: ReportType[]
  options: ReportOption[]
  activeReport: ReportType
  selectedReportOption: ReportOption | null
  setActiveReport: Dispatch<SetStateAction<ReportType>>
}

const ReportsHeaderContext = createContext<ReportsHeaderContextValue | null>(null)

export const ReportsHeaderContextProvider = ({
  value,
  children,
}: PropsWithChildren<{ value: ReportsHeaderContextValue }>) => (
  <ReportsHeaderContext.Provider value={value}>
    {children}
  </ReportsHeaderContext.Provider>
)

export const useReportsHeaderContext = () => {
  return useContext(ReportsHeaderContext)
}
