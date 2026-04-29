import { useState } from 'react'

import { useElementSize } from '@hooks/utils/size/useElementSize'

export const REPORTS_COMPACT_HEADER_BREAKPOINT = 656

export const useReportsCompactHeader = (breakpoint = REPORTS_COMPACT_HEADER_BREAKPOINT) => {
  const [headerWidth, setHeaderWidth] = useState(breakpoint)
  const headerRef = useElementSize<HTMLDivElement>((size) => {
    setHeaderWidth(size.width)
  })

  return {
    headerRef,
    isCompact: headerWidth < breakpoint,
  }
}
