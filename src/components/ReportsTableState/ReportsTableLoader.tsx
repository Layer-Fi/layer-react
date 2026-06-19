import { ReportsTable, ReportsTableHeader } from '@components/ReportsTable/ReportsTable'
import { SkeletonTableLoader } from '@components/SkeletonTableLoader/SkeletonTableLoader'

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
