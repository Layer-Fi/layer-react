import { forwardRef, type PropsWithChildren } from 'react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import type { Spacing } from '../sharedUITypes'
import classNames from 'classnames'

export type StackProps = PropsWithChildren<{
  align?: 'start' | 'center'
  gap?: Spacing
  justify?: 'start' | 'center' | 'end' | 'space-between'
  pbs?: Spacing
  pbe?: Spacing
  pi?: Spacing
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

const Stack = forwardRef<HTMLDivElement, InternalStackProps>(
  function Stack({
    align,
    children,
    className,
    direction,
    gap,
    justify,
    pbs,
    pbe,
    pis,
    pie,
    fluid,
    ...restProps
  },
  ref
) {
    const dataProperties = toDataProperties({
      align,
      direction,
      gap,
      justify,
      pbs,
      pbe,
      pie,
      fluid
    })

    return (
      <div
        ref={ref}
        {...restProps}
        {...dataProperties}
        className={classNames(CLASS_NAME, className)}
      >
        {children}
      </div>
    )
  },
)

export const VStack = forwardRef<HTMLDivElement, StackProps>(
  function VStack(props, ref) {
    return <Stack {...props} ref={ref} direction='column' />
  },
)

export const HStack = forwardRef<HTMLDivElement, StackProps>(
  function HStack(props, ref) {
    return <Stack {...props} ref={ref} direction='row' />
  }
)

export const Spacer = () => <div className='Layer__Spacer' />
