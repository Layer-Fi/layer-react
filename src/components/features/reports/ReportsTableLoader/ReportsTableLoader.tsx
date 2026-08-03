import { SkeletonTableLoader } from '@components/SkeletonTableLoader/SkeletonTableLoader'
import { ReportsTable, ReportsTableHeader } from '@features/reports/ReportsTable/ReportsTable'

type ReportsTableLoaderProps = {
  typeColumnHeader?: string
  totalColumnHeader?: string
  showHeader?: boolean
}

export const ReportsTableLoader = ({
  typeColumnHeader,
  totalColumnHeader,
  showHeader = true,
}: ReportsTableLoaderProps) => {
  return (
    <ReportsTable>
      {showHeader && (
        <ReportsTableHeader
          typeColumnHeader={typeColumnHeader}
          totalColumnHeader={totalColumnHeader}
        />
      )}
      <SkeletonTableLoader
        rows={6}
        cols={[
          { colSpan: 1, trimLastXRows: 4 },
          { colSpan: 1, parts: 2 },
        ]}
      />
    </ReportsTable>
  )
}
