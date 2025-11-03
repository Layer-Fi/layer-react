import { Switch as ReactAriaSwitch, type SwitchProps as ReactAriaSwitchProps } from 'react-aria-components'
import classNames from 'classnames'
import { withRenderProp } from '../../utility/withRenderProp'
import { forwardRef } from 'react'
import './switch.scss'

const CLASS_NAME = 'Layer__Switch'

type SwitchProps = Omit<ReactAriaSwitchProps, 'className'> & {
  className?: string
}

export const Switch = forwardRef<
  HTMLLabelElement,
  SwitchProps
>((
  {
    children,
    className,
    ...props
  },
  ref,
) => {
  return (
    <ReactAriaSwitch
      {...props}
      className={classNames(CLASS_NAME, className)}
      ref={ref}
    >
      {withRenderProp(children, node => (
        <>
          <div slot='indicator' />
          {node}
        </>
      ))}
    </ReactAriaSwitch>
  )
})
Switch.displayName = 'Switch'
