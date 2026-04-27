import { useMemo, useRef } from 'react'
import type { HeaderGroup } from '@tanstack/react-table'

import { useColumnHeaderWidths } from '@hooks/utils/tables/useColumnHeaderWidths'
import { computePinningStyles } from '@components/DataTable/columnUtils'

export const useColumnPinningStyles = <TData>(
  headerGroups: HeaderGroup<TData>[],
) => {
  const headerRef = useRef<HTMLTableSectionElement>(null)

  const leafColumnIds = useMemo(
    () => headerGroups.at(-1)?.headers.map(h => h.column.id) ?? [],
    [headerGroups],
  )

  const headerWidths = useColumnHeaderWidths(headerRef, leafColumnIds)

  const pinningStyles = useMemo(
    () => computePinningStyles(headerGroups, headerWidths),
    [headerGroups, headerWidths],
  )

  return { headerRef, pinningStyles }
}
