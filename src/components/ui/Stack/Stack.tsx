import React, { useMemo, type PropsWithChildren } from 'react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

export type StackProps = PropsWithChildren<{
  gap?: '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '5xl'
  align?: 'start' | 'center'
  justify?: 'center'
  slot?: string
}>

type InternalStackProps = StackProps & {
  direction: 'row' | 'column'
}

const CLASS_NAME = 'Layer__Stack'

function Stack({ align, children, direction, gap, justify, ...restProps }: InternalStackProps) {
  const dataProperties = useMemo(
    () => toDataProperties({ align, gap, justify, direction }),
    [align, direction, gap, justify],
  )

  return (
    <div {...restProps} {...dataProperties} className={CLASS_NAME}>
      {children}
    </div>
  )
}

export function VStack(props: StackProps) {
  return <Stack {...props} direction='column' />
}

export function HStack(props: StackProps) {
  return <Stack {...props} direction='row' />
}
