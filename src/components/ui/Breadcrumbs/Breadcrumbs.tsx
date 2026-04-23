import { type ForwardedRef, forwardRef, type ReactElement } from 'react'
import {
  Breadcrumb as ReactAriaBreadcrumb,
  type BreadcrumbProps as ReactAriaBreadcrumbProps,
  Breadcrumbs as ReactAriaBreadcrumbs,
  type BreadcrumbsProps as ReactAriaBreadcrumbsProps,
} from 'react-aria-components'

import ChevronRight from '@icons/ChevronRight'
import { Link, type LinkProps } from '@ui/Link/Link'

import './breadcrumbs.scss'

const BREADCRUMBS_CLASS_NAME = 'Layer__Breadcrumbs'
const BREADCRUMB_CLASS_NAME = 'Layer__Breadcrumb'

function BreadcrumbsInner<T extends object>(
  { children, ...restProps }: ReactAriaBreadcrumbsProps<T>,
  ref: ForwardedRef<HTMLOListElement>,
) {
  return (
    <ReactAriaBreadcrumbs {...restProps} className={BREADCRUMBS_CLASS_NAME} ref={ref}>
      {children}
    </ReactAriaBreadcrumbs>
  )
}

export const Breadcrumbs = forwardRef(BreadcrumbsInner) as <T extends object>(
  props: ReactAriaBreadcrumbsProps<T> & { ref?: ForwardedRef<HTMLOListElement> },
) => ReactElement

type BreadcrumbProps =
  & Pick<ReactAriaBreadcrumbProps, 'id'>
  & LinkProps

export const Breadcrumb = forwardRef<HTMLLIElement, BreadcrumbProps>(
  function Breadcrumb({ id, children, ...linkProps }, ref) {
    return (
      <ReactAriaBreadcrumb id={id} className={BREADCRUMB_CLASS_NAME} ref={ref}>
        {({ isCurrent }) => (
          <>
            <Link {...linkProps}>{children}</Link>
            {!isCurrent && <ChevronRight />}
          </>
        )}
      </ReactAriaBreadcrumb>
    )
  },
)
