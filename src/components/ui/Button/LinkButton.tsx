import { forwardRef } from 'react'
import classNames from 'classnames'
import {
  Link as ReactAriaLink,
  type LinkProps as ReactAriaLinkProps,
} from 'react-aria-components/Link'

import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { type ButtonStyleProps } from '@ui/Button/Button'
import { legacyClassNames } from '@ui/Button/Button'

import './button.scss'

type LinkButtonProps = Omit<ReactAriaLinkProps, 'className'> & ButtonStyleProps & {
  external?: true
  className?: string
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function LinkButton({
    children,
    className,
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
    underline,
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
      underline,
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
        className={classNames(
          legacyClassNames(
            'Layer__UI__Button',
            'state:asLink',
            `variant:${variant}`,
            icon && 'state:icon',
            fullWidth && 'state:fullWidth',
            restProps.isDisabled && 'state:disabled',
          ),
          className,
        )}
        ref={ref}
      >
        {children}
      </ReactAriaLink>
    )
  },
)
