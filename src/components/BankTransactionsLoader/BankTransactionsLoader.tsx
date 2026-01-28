import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { SkeletonTableLoader } from '@components/SkeletonTableLoader/SkeletonTableLoader'

export const BankTransactionsLoader = () => {
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()
  return (
    <SkeletonTableLoader
      rows={6}
      cols={[
        { colSpan: isCategorizationEnabled ? 6 : 5, trimLastXRows: 4 },
        { colSpan: 1, parts: 2 },
      ]}
      height={20}
    />
  )
}
