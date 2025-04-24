import { forwardRef, type PropsWithChildren } from 'react'
import {
  Menu as ReactAriaMenu,
  MenuItem as ReactAriaMenuItem,
  type MenuItemProps as ReactAriaMenuItemProps,
} from 'react-aria-components'

const MENU_CLASS_NAME = 'Layer__Menu'
type MenuProps = PropsWithChildren

export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  function Menu({ children }, ref) {
    return (
      <ReactAriaMenu className={MENU_CLASS_NAME} ref={ref}>
        {children}
      </ReactAriaMenu>
    )
  },
)

const MENU_ITEM_CLASS_NAME = 'Layer__MenuItem'
type MenuItemProps = PropsWithChildren & Pick<
  ReactAriaMenuItemProps,
  'textValue' | 'onAction'
>

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem({ children, textValue, onAction }, ref) {
    const effectiveTextValue = textValue ?? (typeof children === 'string' ? children : undefined)

    return (
      <ReactAriaMenuItem
        className={MENU_ITEM_CLASS_NAME}
        textValue={effectiveTextValue}
        onAction={onAction}
        ref={ref}
      >
        {children}
      </ReactAriaMenuItem>
    )
  },
)
