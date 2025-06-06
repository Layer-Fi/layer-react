import {
  HTMLAttributeAnchorTarget,
  LinkHTMLAttributes,
  ReactNode,
  useRef,
} from 'react'
import { ButtonVariant, ButtonJustify } from './Button'
import classNames from 'classnames'

export interface LinkProps extends LinkHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  iconOnly?: ReactNode
  iconAsPrimary?: boolean
  justify?: ButtonJustify
  fullWidth?: boolean
  target: HTMLAttributeAnchorTarget
}

export const Link = ({
  className,
  children,
  variant = ButtonVariant.primary,
  leftIcon,
  rightIcon,
  iconOnly,
  iconAsPrimary = false,
  justify = 'center',
  fullWidth,
  ...props
}: LinkProps) => {
  const linkRef = useRef<HTMLAnchorElement>(null)

  let justifyContent = 'center'
  if (justify) {
    justifyContent = justify
  }
  else if (leftIcon && rightIcon) {
    justifyContent = 'space-between'
  }
  else if (rightIcon) {
    justifyContent = 'space-between'
  }
  else if (leftIcon) {
    justifyContent = 'start'
  }

  const baseClassName = classNames(
    'Layer__btn',
    'Layer__btn--as-link',
    `Layer__btn--${variant}`,
    iconOnly ? 'Layer__btn--icon-only' : '',
    iconAsPrimary && 'Layer__btn--with-primary-icon',
    fullWidth && 'Layer__btn--full-width',
    className,
  )

  const startAnimation = () =>
    linkRef.current
    && [...linkRef.current.getElementsByClassName('animateOnHover')].forEach(el =>
      (el as SVGAnimateElement).beginElement(),
    )

  const stopAnimation = () =>
    linkRef.current
    && [...linkRef.current.getElementsByClassName('animateOnHover')].forEach(el =>
      (el as SVGAnimateElement).endElement(),
    )

  return (
    <a
      {...props}
      className={baseClassName}
      onMouseEnter={startAnimation}
      onMouseLeave={stopAnimation}
      ref={linkRef}
    >
      <span className={`Layer__btn-content Layer__justify--${justifyContent}`}>
        {leftIcon && (
          <span
            className={classNames(
              'Layer__btn-icon Layer__btn-icon--left',
              iconAsPrimary && 'Layer__btn-icon--primary',
            )}
          >
            {leftIcon}
          </span>
        )}
        {!iconOnly && <span className='Layer__btn-text'>{children}</span>}
        {rightIcon && (
          <span
            className={classNames(
              'Layer__btn-icon Layer__btn-icon--right',
              iconAsPrimary && 'Layer__btn-icon--primary',
            )}
          >
            {rightIcon}
          </span>
        )}
      </span>
    </a>
  )
}
