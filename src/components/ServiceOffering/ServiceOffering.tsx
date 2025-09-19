import { HTMLAttributes, ReactNode, useEffect, useState } from 'react'
import classNames from 'classnames'
import { InlineWidget } from 'react-calendly'
import { ServiceOfferingOptions } from './ServiceOfferingOptions'
import { Button } from '../ui/Button/Button'

export enum ServiceOfferingType {
  ACCOUNTING_ONLY = 'account_only',
  WITH_BOOKKEEPING = 'accounting_and_bookkeeping',
}

export type OffersPosition = 'left' | 'bottom' | 'right' | 'none'

interface CalendlyPayload {
  event: {
    uri: string
  }
  invitee: {
    uri: string
  }
}

interface CalendlyMessageData {
  event?: string
  payload?: CalendlyPayload
}

export interface ServiceOfferingProps extends HTMLAttributes<HTMLDivElement> {
  calendlyLink?: string
  bookingLink?: string
  platformName: string
  industry: string
  offersPosition?: OffersPosition
  ctaText: string
  accountingPrice: string
  bookkeepingPrice: string
  accountingPricingUnit?: string
  bookkeepingPricingUnit?: string
}

export const ServiceOffering = ({
  calendlyLink,
  bookingLink,
  platformName,
  industry,
  offersPosition = 'none',
  ctaText = 'Learn More',
  accountingPrice,
  bookkeepingPrice,
  accountingPricingUnit = '/mo',
  bookkeepingPricingUnit = '/mo',
  ...props
}: ServiceOfferingProps) => {
  const [isCalendlyVisible, setIsCalendlyVisible] = useState(false)
  const isCalendlyLink = Boolean(calendlyLink)
  const bookingUrl = calendlyLink || bookingLink

  useEffect(() => {
    const handleCalendlyMessage = (e: MessageEvent) => {
      const data = e.data as CalendlyMessageData

      if (data.event && typeof data.event === 'string' && data.event.indexOf('calendly') === 0) {
        console.debug('Calendly event:', data.event)

        if (data.event === 'calendly.event_scheduled') {
          console.debug('Booking successful!', data.payload)
        }
      }
    }

    window.addEventListener('message', handleCalendlyMessage)

    return () => {
      window.removeEventListener('message', handleCalendlyMessage)
    }
  }, [])

  const baseClassName = classNames(
    'Layer__service-offering',
    {
      'Layer__service-offering--with-left-offers': offersPosition === 'left',
      'Layer__service-offering--with-right-offers': offersPosition === 'right',
      'Layer__service-offering--with-bottom-offers': offersPosition === 'bottom',
    },
  )

  const handleLearnMore = () => {
    if (isCalendlyLink) {
      setIsCalendlyVisible(!isCalendlyVisible)
    }
    else if (bookingUrl) {
      window.open(bookingUrl, '_blank')
    }
  }

  const renderOfferingOptions = () => {
    if (offersPosition === 'none') return null
    return (
      <ServiceOfferingOptions
        platformName={platformName}
        industry={industry}
        ctaText={ctaText}
        bookkeepingPrice={bookkeepingPrice}
        accountingPrice={accountingPrice}
        bookkeepingPricingUnit={bookkeepingPricingUnit}
        accountingPricingUnit={accountingPricingUnit}
        onGetStartedAccounting={handleLearnMore}
        onGetStartedBookkeeping={handleLearnMore}
        className='Layer__service-offering__offers'
      />
    )
  }

  const renderMainContent = () => (
    <div className='Layer__service-offering__main'>
      <div className='Layer__service-offering__header'>
        <h1 className='Layer__service-offering__title'>
          {platformName}
          {' '}
          Accounting
        </h1>
        <p className='Layer__service-offering__subtitle'>
          Track your business finances, right within
          {' '}
          {platformName}
          .
        </p>
      </div>

      <ul className='Layer__service-offering__features'>
        {features.map((feature, index) => (
          <li key={index} className='Layer__service-offering__feature'>
            <div className='Layer__service-offering__feature-icon'>
              <span>{feature.icon}</span>
            </div>
            <div className='Layer__service-offering__feature-side'>
              <h4 className='Layer__service-offering__feature-title'>
                {feature.title}
              </h4>
              <p className='Layer__service-offering__feature-text'>
                {feature.text}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className={classNames(
        'Layer__service-offering__actions',
        { hiding: isCalendlyVisible },
      )}
      >
        <Button
          variant='solid'
          style={{ color: 'white', margin: 'auto 0', fontWeight: 'medium' }}
          onClick={handleLearnMore}
        >
          {ctaText}
        </Button>
      </div>

      {calendlyLink && (
        <div
          className={classNames(
            'Layer__service-offering__calendly-container',
            { visible: isCalendlyVisible },
          )}
        >
          <InlineWidget url={calendlyLink} />
        </div>
      )}

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

  type OfferContent = {
    icon: ReactNode
    title: string
    text: string
  }

  const features: OfferContent[] = [
    {
      icon: '📊',
      title: 'All your finances in one place',
      text: `Directly integrated with your ${platformName} data, so you can see your business performance and profit in real-time.`,
    },
    {
      icon: '📋',
      title: `Built for ${industry}`,
      text: `Track your expenses and get easy to understand reports designed specifically for ${industry} businesses.`,
    },
  ]

  const valueProps: OfferContent[] = [
    {
      icon: '🏦',
      title: 'Connect your business accounts',
      text: `Connect your business bank accounts and credit cards right within ${platformName}.`,
    },
    {
      icon: '📂',
      title: 'Categorize expenses',
      text: `Organize transactions into categories built for ${industry}.`,
    },
    {
      icon: '📈',
      title: 'Get a clear picture of your business',
      text: 'See your business profitability and stay organized for tax time.',
    },
  ]

  return (
    <div className={baseClassName} {...props}>
      <div className='Layer__service-offering__content'>
        {offersPosition === 'left' && renderOfferingOptions()}
        {renderMainContent()}
        {offersPosition === 'right' && renderOfferingOptions()}
      </div>
      {offersPosition === 'bottom' && renderOfferingOptions()}
    </div>
  )
}
