import { HTMLAttributes } from 'react'
import classNames from 'classnames'
import { useLayerContext } from '../../contexts/LayerContext'

export enum ServiceOfferingType {
  ACCOUNTING_ONLY = 'account_only',
  WITH_BOOKKEEPING = 'accounting_and_bookkeeping',
}

export interface ServiceOfferingProps extends HTMLAttributes<HTMLDivElement> {
  calendlyLink: string
}

export const ServiceOffering = ({
  calendlyLink,
  ...props
}: ServiceOfferingProps) => {
  const baseClassName = classNames(
    'Layer__service-offering',
  )

  const { business } = useLayerContext()
  
  const features = [
    {
      icon: '📊',
      title: 'All your finances in one place',
      text: `Directly integrated with your ${business?.legal_name} data, so you can see your business performance and profit in real-time.`,
    },
    {
      icon: '📋',
      title: `Built for ${business?.legal_name}`,
      text: `Track your expenses and get easy to understand reports designed specifically for ${business?.legal_name} businesses.`,
    },
  ]

  const valueProps = [
    {
      icon: '🏦',
      title: 'Connect your business accounts',
      text: `Connect your business bank accounts and credit cards right within ${business?.legal_name}.`,
    },
    {
      icon: '📂',
      title: 'Categorize expenses',
      text: `Organize transactions into categories built for ${business?.legal_name}.`,
    },
    {
      icon: '📈',
      title: 'Get a clear picture of your business',
      text: 'See your business profitability and stay organized for tax time.',
    },
  ]

  return (
    <div className={baseClassName} {...props}>
      <div className='Layer__service-offering__header'>
        <h1 className='Layer__service-offering__title'>
          {business?.legal_name}
          {' '}
          Accounting
        </h1>
        <p className='Layer__service-offering__subtitle'>
          Track your business finances, right within
          {' '}
          {business?.legal_name}
          .
        </p>
      </div>

      <ul className='Layer__service-offering__features'>
        {features.map((feature, index) => (
          <li key={index} className='Layer__service-offering__feature'>
            <div className='Layer__service-offering__feature-icon'>
              {feature.icon}
            </div>
            <h4 className='Layer__service-offering__feature-title'>
              {feature.title}
            </h4>
            <p className='Layer__service-offering__feature-text'>
              {feature.text}
            </p>
          </li>
        ))}
      </ul>

      <div className='Layer__service-offering__actions'>
        <button
          className='Layer__service-offering__cta-button'
          onClick={() => window.open(calendlyLink, '_blank')}
        >
          Learn more
        </button>
      </div>

      <h3 className='Layer__service-offering__value-prop-heading'>
        The easiest way to manage your business finances
      </h3>

      <div className='Layer__service-offering__value-props'>
        {valueProps.map((valueProp, index) => (
          <div key={index} className='Layer__service-offering__value-prop'>
            <div className='Layer__service-offering__value-prop-icon'>
              {valueProp.icon}
            </div>
            <h4 className='Layer__service-offering__value-prop-title'>
              {valueProp.title}
            </h4>
            <p className='Layer__service-offering__value-prop-text'>
              {valueProp.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
