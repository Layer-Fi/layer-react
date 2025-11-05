import { Link as ReactAriaLink } from 'react-aria-components/Link'
import { forwardRef, type PropsWithChildren } from 'react'
import { type LinkProps as ReactAriaLinkProps } from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import './link.scss'

const LINK_CLASS_NAME = 'Layer__UI__Link'

type LinkSize = 'xs' | 'sm' | 'md' | 'lg'

type LinkProps = Omit<ReactAriaLinkProps, 'className'> & PropsWithChildren<{
  size?: LinkSize
  ellipsis?: true
  external?: true
  disabled?: true
}>

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  function Link({
    children,
    size = 'md',
    ellipsis,
    external,
    disabled,
    href,
    target,
    rel,
    ...restProps
  }, ref) {
    const dataProperties = toDataProperties({
      size,
      ellipsis,
      external,
      disabled,
    })
    const effectiveTarget = external ? '_blank' : target
    const effectiveRel = external ? 'noopener noreferrer' : rel
    return (
      <ReactAriaLink
        {...restProps}
        {...dataProperties}
        href={href}
        target={effectiveTarget}
        rel={effectiveRel}
        className={LINK_CLASS_NAME}
        ref={ref}
      >
        {children}
      </ReactAriaLink>
    )
  },
)
