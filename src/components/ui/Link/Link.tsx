import { forwardRef, type PropsWithChildren } from 'react'
import { Link as ReactAriaLink, type LinkProps as ReactAriaLinkProps } from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import type { Spacing } from '../sharedUITypes'

const LINK_CLASS_NAME = 'Layer__UI__Link'

export type LinkVariant = 'primary' | 'subtle' | 'inline'
type LinkSize = 'xs' | 'sm' | 'md' | 'lg'
type LinkUnderline = 'none' | 'hover' | 'always'

type LinkProps = Omit<ReactAriaLinkProps, 'className'> & PropsWithChildren<{
  variant?: LinkVariant
  size?: LinkSize
  weight?: 'normal' | 'bold'
  underline?: LinkUnderline
  ellipsis?: true
  external?: true
  pb?: Spacing
  pbe?: Spacing
  pbs?: Spacing
}>

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  function Link({
    children,
    variant = 'inline',
    size = 'md',
    weight,
    underline,
    ellipsis,
    external,
    pb,
    pbe,
    pbs,
    href,
    target,
    rel,
    ...restProps
  }, ref) {
    const dataProperties = toDataProperties({
      variant,
      size,
      weight,
      underline,
      ellipsis,
      external,
      pb,
      pbe,
      pbs,
    })

    // Automatically handle external links
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
