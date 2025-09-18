import { ReactNode, HTMLAttributes } from 'react'
import classNames from 'classnames'

export enum ServiceOfferingVariant {
  DEFAULT = 'default',
  FEATURED = 'featured',
  PREMIUM = 'premium',
}

export enum ServiceOfferingSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export interface ServiceOfferingProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  variant?: ServiceOfferingVariant
  size?: ServiceOfferingSize
  icon?: ReactNode
  price?: string
  features?: string[]
  actions?: ReactNode
  children?: ReactNode
}

export const ServiceOffering = ({
  className,
  title,
  description,
  variant = ServiceOfferingVariant.DEFAULT,
  size = ServiceOfferingSize.MEDIUM,
  icon,
  price,
  features,
  actions,
  children,
  ...props
}: ServiceOfferingProps) => {
  const baseClassName = classNames(
    'Layer__service-offering',
    `Layer__service-offering--${variant}`,
    `Layer__service-offering--${size}`,
    className,
  )

  return (
    <div className={baseClassName} {...props}>
      {icon && (
        <div className='Layer__service-offering__icon'>
          {icon}
        </div>
      )}

      <p>Hello world!</p>

      <div className='Layer__service-offering__header'>
        <h3 className='Layer__service-offering__title'>
          {title}
          {' '}
          fff
        </h3>
        {price && (
          <div className='Layer__service-offering__price'>{price}</div>
        )}
      </div>

      {description && (
        <p className='Layer__service-offering__description'>{description}</p>
      )}

      {features && features.length > 0 && (
        <ul className='Layer__service-offering__features'>
          {features.map((feature, index) => (
            <li key={index} className='Layer__service-offering__feature'>
              {feature}
            </li>
          ))}
        </ul>
      )}

      {children && (
        <div className='Layer__service-offering__content'>
          {children}
        </div>
      )}

      {actions && (
        <div className='Layer__service-offering__actions'>
          {actions}
        </div>
      )}
    </div>
  )
}
