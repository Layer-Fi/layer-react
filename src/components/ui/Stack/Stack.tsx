import { type PropsWithChildren } from 'react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import type { Spacing } from '../sharedUITypes'
import classNames from 'classnames'

export type StackProps = PropsWithChildren<{
  align?: 'start' | 'center'
  gap?: Spacing
  justify?: 'start' | 'center' | 'end' | 'space-between'
  pbs?: Spacing
  pbe?: Spacing
  pis?: Spacing
  pie?: Spacing
  fluid?: boolean
  slot?: string
  className?: string
}>

type InternalStackProps = StackProps & {
  direction: 'row' | 'column'
}

const CLASS_NAME = 'Layer__Stack'

function Stack({ align, children, direction, gap, justify, pbs, pbe, pis, pie, fluid, className, ...restProps }: InternalStackProps) {
  const dataProperties = toDataProperties({ align, direction, gap, justify, pbs, pbe, pis, pie, fluid })

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

export const Spacer = () => <div className='Layer__Spacer' />
