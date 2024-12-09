import React, { useMemo, type PropsWithChildren } from 'react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import classNames from 'classnames'

export type StackProps = PropsWithChildren<{
  gap?: '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '5xl'
  align?: 'start' | 'center'
  justify?: 'center' | 'start' | 'end'
  flex?: string
  slot?: string
  className?: string
}>

type InternalStackProps = StackProps & {
  direction: 'row' | 'column'
}

const CLASS_NAME = 'Layer__Stack'

export function Stack(
  { align, children, direction, gap, justify, className, ...restProps }: InternalStackProps
) {
  const dataProperties = useMemo(
    () => toDataProperties({ align, gap, justify, direction }),
    [align, direction, gap, justify],
  )

  return (
    <div {...restProps} {...dataProperties} className={classNames(CLASS_NAME, className)}>
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
