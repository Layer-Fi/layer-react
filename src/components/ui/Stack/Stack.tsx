import { forwardRef, type PropsWithChildren } from 'react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import type { Spacing } from '../sharedUITypes'
import classNames from 'classnames'

export type StackProps = PropsWithChildren<{
  align?: 'start' | 'center'
  gap?: Spacing
  justify?: 'start' | 'center' | 'end'
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

const Stack = forwardRef<HTMLDivElement, InternalStackProps>(
  ({ align, children, direction, gap, justify, pbs, pbe, pis, pie, fluid, className, ...restProps }, ref) => {
    const dataProperties = toDataProperties({ align, direction, gap, justify, pbs, pbe, pis, pie, fluid })

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
Stack.displayName = 'Stack'

export const VStack = forwardRef<HTMLDivElement, StackProps>((props, ref) => {
  return <Stack {...props} ref={ref} direction='column' />
})
VStack.displayName = 'VStack'

export const HStack = forwardRef<HTMLDivElement, StackProps>((props, ref) => {
  return <Stack {...props} ref={ref} direction='row' />
})
HStack.displayName = 'HStack'

export const Spacer = () => <div className='Layer__Spacer' />
