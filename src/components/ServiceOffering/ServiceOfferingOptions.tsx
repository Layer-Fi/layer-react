import { HTMLAttributes } from 'react'
import classNames from 'classnames'
import { Button } from '../ui/Button/Button'

export interface ServiceOfferingOptionsProps extends HTMLAttributes<HTMLDivElement> {
  platformName: string
  industry: string
  ctaText: string
  accountingPrice: string
  bookkeepingPrice: string
  accountingPricingUnit: string
  bookkeepingPricingUnit: string
  onGetStartedAccounting?: () => void
  onGetStartedBookkeeping?: () => void
}

export const ServiceOfferingOptions = ({
  platformName,
  industry,
  ctaText,
  accountingPrice,
  bookkeepingPrice,
  accountingPricingUnit = '/mo',
  bookkeepingPricingUnit = '/mo',
  onGetStartedAccounting,
  onGetStartedBookkeeping,
  ...props
}: ServiceOfferingOptionsProps) => {
  const baseClassName = classNames(
    'Layer__service-offering-options',
  )

  return (
    <div className={baseClassName} {...props}>
      <h2 className='Layer__service-offering-options__header'>
        Use
        {' '}
        {platformName}
        {' '}
        Accounting yourself, or let our team of experts handle bookkeeping for you
      </h2>

      <div className='Layer__service-offering-options__grid'>
        {/* Accounting Software Option */}
        <div className='Layer__service-offering-options__card Layer__service-offering-options__card--accounting'>
          <div>
            <div className='Layer__service-offering-options__card-badge'>
              Easy to use software
            </div>
            <h3 className='Layer__service-offering-options__card-title'>
              {platformName}
              {' '}
              Accounting
            </h3>
          </div>

          <p className='Layer__service-offering-options__card-description'>
            The best accounting software for
            {' '}
            {industry}
            {' '}
            businesses. Fast to set up and easy to use.
          </p>

          <div className='Layer__service-offering-options__features'>
            <h4 className='Layer__service-offering-options__features-title'>Features</h4>
            <ul className='Layer__service-offering-options__features-list'>
              <li>
                Direct integration with
                {' '}
                {platformName}
              </li>
              <li>Track expenses and receipts</li>
              <li>Easy to understand profitability charts and reports</li>
            </ul>
          </div>

          <div className='Layer__service-offering-options__footer'>
            <span className='Layer__service-offering-options__price-label'>Starting at</span>
            <div className='Layer__service-offering-options__pricing'>
              <span className='Layer__service-offering-options__price'>{accountingPrice}</span>
              <span className='Layer__service-offering-options__price-period'>
                {accountingPricingUnit}
              </span>
            </div>

            <Button
              variant='solid'
              style={{ color: 'white', margin: 'auto 0', fontWeight: 'medium' }}
              onClick={onGetStartedAccounting}
            >
              {ctaText}
            </Button>
          </div>
        </div>

        {/* Full-service Bookkeeping Option */}
        <div className='Layer__service-offering-options__card Layer__service-offering-options__card--bookkeeping'>
          <div className='Layer__service-offering-options__card-badge'>
            A complete bookkeeping service
          </div>

          <h3 className='Layer__service-offering-options__card-title'>
            Full-service Bookkeeping
          </h3>

          <p className='Layer__service-offering-options__card-description'>
            Get a dedicated bookkeeper who will organize and manage your books for you.
          </p>

          <div className='Layer__service-offering-options__features'>
            <h4 className='Layer__service-offering-options__features-title'>Features</h4>
            <ul className='Layer__service-offering-options__features-list'>
              <li>Personalized setup with your bookkeeper</li>
              <li>Monthly books done for you</li>
              <li>Complete financial reports and end of year tax packet</li>
            </ul>
          </div>

          <div className='Layer__service-offering-options__footer'>
            <span className='Layer__service-offering-options__price-label'>Starting at</span>
            <div className='Layer__service-offering-options__pricing'>
              <div>
                <span className='Layer__service-offering-options__price'>{bookkeepingPrice}</span>
                <span className='Layer__service-offering-options__price-period'>
                  {bookkeepingPricingUnit}
                </span>
              </div>
            </div>

            <Button
              variant='solid'
              style={{ color: 'white', margin: 'auto 0', fontWeight: 'medium' }}
              onClick={onGetStartedBookkeeping}
            >
              {ctaText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
