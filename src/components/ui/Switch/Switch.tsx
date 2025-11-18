import { forwardRef } from 'react'
import { Switch as ReactAriaSwitch, type SwitchProps as ReactAriaSwitchProps } from 'react-aria-components'

import { withRenderProp } from '@components/utility/withRenderProp'

import './switch.scss'

const SWITCH_CLASS_NAME = 'Layer__Switch'

type SwitchProps = Omit<ReactAriaSwitchProps, 'className'>

export const Switch = forwardRef<
  HTMLLabelElement,
  SwitchProps
>((
  {
    children,
    ...props
  },
  ref,
) => {
  return (
    <ReactAriaSwitch
      {...props}
      className={SWITCH_CLASS_NAME}
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
