import {
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'
import classNames from 'classnames'

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  active?: boolean
  withBorder?: boolean
  href?: HTMLAnchorElement['href']
  target?: HTMLAnchorElement['target']
  rel?: HTMLAnchorElement['rel']
  download?: HTMLAnchorElement['download']
  onClick?: (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>,
  ) => void
}

export const IconButton = ({
  className,
  children: _children,
  icon,
  active,
  withBorder = false,
  href,
  target,
  rel,
  download,
  ...props
}: IconButtonProps) => {
  const baseClassName = classNames(
    'Layer__icon-btn',
    `Layer__icon-btn--${active ? 'active' : 'inactive'}`,
    withBorder && 'Layer__icon-btn--border',
    className,
  )

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        download={download}
        className={baseClassName}
        onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
          if (props.disabled) e.preventDefault()
        }}
      >
        {icon}
      </a>
    )
  }

  return (
    <button {...props} className={baseClassName}>
      {icon}
    </button>
  )
}
