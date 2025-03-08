import { type PropsWithChildren } from 'react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import type { Spacing } from '../sharedUITypes'

export type StackProps = PropsWithChildren<{
  align?: 'start' | 'center'
  gap?: Spacing
  justify?: 'start' | 'center' | 'end'
  pbs?: Spacing
  pbe?: Spacing
  slot?: string
}>

type InternalStackProps = StackProps & {
  direction: 'row' | 'column'
}

const CLASS_NAME = 'Layer__Stack'

function Stack({ align, children, direction, gap, justify, pbs, pbe, ...restProps }: InternalStackProps) {
  const dataProperties = toDataProperties({ align, direction, gap, justify, pbs, pbe })

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
