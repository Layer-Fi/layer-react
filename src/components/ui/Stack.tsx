import React, { useMemo, type PropsWithChildren } from 'react'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'

export type StackProps = PropsWithChildren<{
  gap?: '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '5xl'
  align?: 'start'
}>

const CLASS_NAME = 'Layer__VStack'

export function VStack({ align, children, gap }: StackProps) {
  const dataProperties = useMemo(
    () => toDataProperties({ align, gap }),
    [align, gap],
  )

  return (
    <div className={CLASS_NAME} {...dataProperties}>
      {children}
    </div>
  )
}
