import { SkeletonTableLoader } from '../SkeletonTableLoader/SkeletonTableLoader'

export const BankTransactionsLoader = () => {
  return (
    <SkeletonTableLoader
      rows={6}
      cols={[
        { colSpan: 5, trimLastXRows: 4 },
        { colSpan: 1, parts: 2 },
      ]}
      height={20}
    />
  )
}
