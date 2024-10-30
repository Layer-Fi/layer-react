import { PropsWithChildren, useMemo } from 'react'
import React from 'react'
import type { Variants } from '../../../utils/styleUtils/sizeVariants'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

type ProfitAndLossSummariesHeadingProps = {
  variants?: Variants
} & PropsWithChildren

const HEADING_CLASS_NAME = 'Layer__ProfitAndLossSummariesSummaryHeading'

export function ProfitAndLossSummariesHeading({
  variants,
  children,
}: ProfitAndLossSummariesHeadingProps) {
  const { size = 'sm' } = variants ?? {}
  const labelDataProperties = useMemo(() => toDataProperties({ size }), [size])

  return (
    <h3 className={HEADING_CLASS_NAME} {...labelDataProperties}>
      {children}
    </h3>
  )
}
