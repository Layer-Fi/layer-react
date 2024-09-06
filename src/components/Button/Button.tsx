import React, { ButtonHTMLAttributes, ReactNode, useRef } from 'react'
import LoaderIcon from '../../icons/Loader'
import classNames from 'classnames'

export enum ButtonVariant {
  primary = 'primary',
  secondary = 'secondary',
  tertiary = 'tertiary',
}

export type ButtonJustify = 'center' | 'space-between' | 'start'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  iconOnly?: ReactNode
  iconAsPrimary?: boolean
  justify?: ButtonJustify
  fullWidth?: boolean
  isProcessing?: boolean
}

export const Button = ({
  className,
  children,
  variant = ButtonVariant.primary,
  leftIcon,
  rightIcon,
  iconOnly,
  iconAsPrimary = false,
  justify = 'center',
  fullWidth,
  isProcessing,
  ...props
}: ButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  let justifyContent = 'center'
  if (justify) {
    justifyContent = justify
  } else if (leftIcon && rightIcon) {
    justifyContent = 'space-between'
  } else if (rightIcon) {
    justifyContent = 'space-between'
  } else if (leftIcon) {
    justifyContent = 'start'
  }

  const baseClassName = classNames(
    'Layer__btn',
    `Layer__btn--${variant}`,
    iconOnly ? 'Layer__btn--icon-only' : '',
    iconAsPrimary && 'Layer__btn--with-primary-icon',
    fullWidth && 'Layer__btn--full-width',
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
      <span className={`Layer__btn-content Layer__justify--${justifyContent}`}>
        {leftIcon && (
          <span
            className={classNames(
              'Layer__btn-icon Layer__btn-icon--left',
              iconAsPrimary && 'Layer__btn-icon--primary',
            )}
          >
            {isProcessing ? (
              <LoaderIcon size={12} className='Layer__anim--rotating' />
            ) : (
              leftIcon
            )}
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
            {isProcessing ? (
              <LoaderIcon size={12} className='Layer__anim--rotating' />
            ) : (
              rightIcon
            )}
          </span>
        )}
      </span>
    </button>
  )
}
