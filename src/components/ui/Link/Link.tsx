import { forwardRef, type PropsWithChildren } from 'react'
import { Link as ReactAriaLink, type LinkProps as ReactAriaLinkProps } from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

const LINK_CLASS_NAME = 'Layer__UI__Link'

type LinkSize = 'xs' | 'sm' | 'md' | 'lg'

type LinkProps = Omit<ReactAriaLinkProps, 'className'> & PropsWithChildren<{
  size?: LinkSize
  weight?: 'normal' | 'bold'
  ellipsis?: true
  external?: true
  disabled?: true
}>

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  function Link({
    children,
    size = 'md',
    weight,
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
      weight,
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
