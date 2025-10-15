import { forwardRef, type PropsWithChildren } from 'react'
import { Link as ReactAriaLink, type LinkProps as ReactAriaLinkProps } from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import type { Spacing } from '../sharedUITypes'

const LINK_CLASS_NAME = 'Layer__UI__Link'

type LinkSize = 'xs' | 'sm' | 'md' | 'lg'

type LinkProps = Omit<ReactAriaLinkProps, 'className'> & PropsWithChildren<{
  size?: LinkSize
  weight?: 'normal' | 'bold'
  ellipsis?: true
  external?: true
  disabled?: true
  pb?: Spacing
  pbe?: Spacing
  pbs?: Spacing
}>

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  function Link({
    children,
    size = 'md',
    weight,
    ellipsis,
    external,
    disabled,
    pb,
    pbe,
    pbs,
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
      pb,
      pbe,
      pbs,
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
