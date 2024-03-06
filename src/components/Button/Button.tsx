import React, { ButtonHTMLAttributes, ReactNode, useRef } from 'react'
import classNames from 'classnames'

export enum ButtonVariant {
  primary = 'primary',
  secondary = 'secondary',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  iconOnly?: ReactNode
  iconAsPrimary?: boolean
}

export const Button = ({
  className,
  children,
  variant = ButtonVariant.primary,
  leftIcon,
  rightIcon,
  iconOnly,
  iconAsPrimary = false,
  ...props
}: ButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  let justify = 'center'
  if (leftIcon && rightIcon) {
    justify = 'space-between'
  } else if (rightIcon) {
    justify = 'space-between'
  } else if (leftIcon) {
    justify = 'start'
  }

  const baseClassName = classNames(
    'Layer__btn',
    `Layer__btn--${variant}`,
    iconOnly ? 'Layer__btn--icon-only' : '',
    iconAsPrimary && 'Layer__btn--with-primary-icon',
    className,
  )

  const startAnimation = () =>
    buttonRef.current &&
    [...buttonRef.current.getElementsByClassName('animateOnHover')].forEach(
      el => (el as SVGAnimateElement).beginElement(),
    )

  const stopAnimation = () =>
    buttonRef.current &&
    [...buttonRef.current.getElementsByClassName('animateOnHover')].forEach(
      el => (el as SVGAnimateElement).endElement(),
    )

  return (
    <button
      {...props}
      className={baseClassName}
      onMouseEnter={startAnimation}
      onMouseLeave={stopAnimation}
      ref={buttonRef}
    >
      <span className={`Layer__btn-content Layer__justify--${justify}`}>
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
    </button>
  )
}
