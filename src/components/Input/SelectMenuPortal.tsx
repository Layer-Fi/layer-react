import { type ComponentProps } from 'react'
import {
  components,
  type GroupBase,
} from 'react-select'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'

export const SelectMenuPortal = <T, IsMulti extends boolean = false>({
  children,
  ...restProps
}: ComponentProps<typeof components.MenuPortal<T, IsMulti, GroupBase<T>>>) => {
  const dataProperties = toDataProperties({ 'react-aria-top-layer': true })

  return (
    <components.MenuPortal
      {...restProps}
      // We need to pass data-react-aria-top-layer to ensure that this is never made inert by
      // react-aria-components if the ModalOverlay is on screen. We should approach this in a
      // better way when this PR is merged: https://github.com/adobe/react-spectrum/pull/8796
      // @ts-expect-error - see above
      innerProps={dataProperties}
    >
      {children}
    </components.MenuPortal>
  )
}
