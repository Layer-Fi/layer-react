import { useBillsContext } from '../../contexts/BillsContext'
import { SkeletonTableLoader } from '../SkeletonTableLoader/SkeletonTableLoader'

export const BillsTableLoader = () => {
  const { status } = useBillsContext()

  return (
    <SkeletonTableLoader
      rows={6}
      cols={[
        { colSpan: status === 'PAID' ? 3 : 4 },
        { colSpan: 2 },
      ]}
    />
  )
}
