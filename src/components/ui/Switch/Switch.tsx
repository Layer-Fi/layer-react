import { forwardRef, useMemo } from 'react'
import classNames from 'classnames'
import {
  Switch as ReactAriaSwitch,
  type SwitchProps as ReactAriaSwitchProps,
} from 'react-aria-components/Switch'

import { toDataProperties } from '@utils/shared/styleUtils/toDataProperties'
import { withRenderProp } from '@components/utility/withRenderProp'

import './switch.scss'

const SWITCH_CLASS_NAME = 'Layer__UI__Switch'

// A switch is not a validated field in react-aria, so it has no `data-invalid` of its own.
type SwitchProps = ReactAriaSwitchProps & { isInvalid?: boolean }

export const Switch = forwardRef<
  HTMLLabelElement,
  SwitchProps
>((
  {
    children,
    className,
    isInvalid,
    ...props
  },
  ref,
) => {
  const dataProperties = useMemo(() => toDataProperties({ invalid: isInvalid }), [isInvalid])

  return (
    <ReactAriaSwitch
      {...dataProperties}
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
