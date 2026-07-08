import { type PropsWithChildren, useLayoutEffect, useState } from 'react'

import { useGlobalDateRangeActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'

import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'

export const PinnedFixtureYear = ({ year = FIXTURE_YEAR, children }: PropsWithChildren<{ year?: number }>) => {
  const { setYear } = useGlobalDateRangeActions()
  const [isPinned, setIsPinned] = useState(false)

  useLayoutEffect(() => {
    setYear({ startDate: new Date(year, 0, 1) })
    setIsPinned(true)
  }, [setYear, year])

  return isPinned ? children : null
}
