import { forwardRef } from 'react'
import { Link as ReactAriaLink, type LinkProps as ReactAriaLinkProps } from 'react-aria-components'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { BUTTON_CLASS_NAMES, type ButtonStyleProps } from '@ui/Button/Button'

import './button.scss'

type LinkButtonProps = Omit<ReactAriaLinkProps, 'className'> & ButtonStyleProps & {
  external?: true
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function LinkButton({
    children,
    ellipsis,
    icon,
    inset,
    size = 'md',
    variant = 'solid',
    fullWidth = false,
    flex = false,
    external,
    href,
    target,
    rel,
    ...restProps
  }, ref) {
    const dataProperties = toDataProperties({
      ellipsis,
      icon,
      inset,
      size,
      variant,
      'full-width': fullWidth,
      flex,
    })

    const effectiveTarget = external ? '_blank' : target
    const externalRel = external ? 'noopener noreferrer' : ''
    const effectiveRel = `${externalRel} ${rel}`.trim()

    return (
      <ReactAriaLink
        {...restProps}
        {...dataProperties}
        href={href}
        target={effectiveTarget}
        rel={effectiveRel}
        className={BUTTON_CLASS_NAMES.DEFAULT}
        ref={ref}
      >
        {children}
      </ReactAriaLink>
    )
  },
)
