import React, { PropsWithChildren } from 'react'

const CLASS_NAME = 'Layer__BookkeepingProfitAndLossSummariesContainer'

export function BookkeepingProfitAndLossSummariesContainer({
  children,
}: PropsWithChildren) {
  return <div className={CLASS_NAME}>{children}</div>
}
