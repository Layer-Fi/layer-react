import React, { useMemo, type PropsWithChildren } from 'react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

export type StackProps = PropsWithChildren<{
  gap?: '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '5xl'
  align?: 'start' | 'center'
  justify?: 'center'
  slot?: string
}>

const CLASS_NAME = 'Layer__VStack'

export function VStack({ align, children, gap, justify, ...restProps }: StackProps) {
  const dataProperties = useMemo(
    () => toDataProperties({ align, gap, justify }),
    [align, gap, justify],
  )

  return (
    <div {...restProps} {...dataProperties} className={CLASS_NAME}>
      {children}
    </div>
  )
}
