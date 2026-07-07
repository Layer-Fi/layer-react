import { type PropsWithChildren, useLayoutEffect, useState } from 'react'

import { useGlobalDateRangeActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'

export const PinnedFixtureYear = ({ year, children }: PropsWithChildren<{ year: number }>) => {
  const { setYear } = useGlobalDateRangeActions()
  const [isPinned, setIsPinned] = useState(false)

  useLayoutEffect(() => {
    setYear({ startDate: new Date(year, 0, 1) })
    setIsPinned(true)
  }, [setYear, year])

  return isPinned ? children : null
}
