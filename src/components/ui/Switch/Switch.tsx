import { forwardRef } from 'react'
import classNames from 'classnames'
import { Switch as ReactAriaSwitch, type SwitchProps as ReactAriaSwitchProps } from 'react-aria-components'

import { withRenderProp } from '@components/utility/withRenderProp'

import './switch.scss'

const SWITCH_CLASS_NAME = 'Layer__UI__Switch'

type SwitchProps = ReactAriaSwitchProps

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
      className={classNames(SWITCH_CLASS_NAME, className)}
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
