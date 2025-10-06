import { Button } from '../ui/Button/Button'
import { P, Span } from '../ui/Typography/Text'
import { HStack, VStack } from '../ui/Stack/Stack'
import { Heading } from '../ui/Typography/Heading'
import { Badge } from '../Badge'
import { BadgeSize, BadgeVariant } from '../Badge/Badge'
import { ServiceOfferingPlatformConfig, ServiceOfferingConfigOverridesResolved } from './types'
import { isCalendlyLink } from '../../hooks/useCalendly/useCalendly'
import { ServiceOfferingHelper } from './ServiceOfferingHelper'
import { Check } from 'lucide-react'
import classNames from 'classnames'
import { useCallback, useMemo } from 'react'

export interface ServiceOfferingOptionsProps {
  type: 'accounting' | 'bookkeeping'
  platformConfig: ServiceOfferingPlatformConfig
  config: ServiceOfferingConfigOverridesResolved
  openCalendly: (link: string) => void
  className: string
}

export const ServiceOfferingOffer = ({
  type,
  platformConfig,
  config,
  openCalendly,
  className,
}: ServiceOfferingOptionsProps) => {
  const handleCtaClick = useCallback(() => {
    if (isCalendlyLink(config.cta.primary)) {
      openCalendly(config.cta.primary.url)
    }
    else {
      window.open(config.cta.primary.url, '_blank')
    }
  }, [config.cta.primary, openCalendly])

  const features = useMemo(() => type === 'bookkeeping'
    ? [
      'Personalized setup with your bookkeeper',
      'Monthly books done for you',
      'Complete financial reports and end of year tax packet',
    ]
    : [
      'Direct integration with {platformName}',
      'Track expenses and receipts',
      'Easy to understand profitability charts and reports',
    ], [type])

  const baseClassName = classNames(className)
  const badgeVariant = type === 'bookkeeping' ? BadgeVariant.SUCCESS : BadgeVariant.INFO

  return (
    <div className={baseClassName}>
      <VStack pb='lg' pi='lg' gap='2xl' className='Layer__service-offering-options__card'>
        <VStack gap='md'>
          <HStack>
            <Badge size={BadgeSize.SMALL} variant={badgeVariant}>
              {ServiceOfferingHelper.bindTextValues(config.stringOverrides.badge, platformConfig)}
            </Badge>
          </HStack>
          <Heading size='sm'>
            {ServiceOfferingHelper.bindTextValues(config.stringOverrides.title, platformConfig)}
          </Heading>
          <P variant='subtle'>
            {ServiceOfferingHelper.bindTextValues(config.stringOverrides.subtitle, platformConfig)}
          </P>
        </VStack>

        <VStack className='Layer__service-offering-options__features' gap='sm'>
          <Heading size='xs' weight='normal' variant='subtle'>Features</Heading>
          <VStack className='Layer__service-offering-options__features-list'>
            {features.map((f, i) => {
              return (
                <HStack key={i} gap='xs'>
                  <Check size={14} />
                  <Span size='sm' variant='subtle'>
                    {ServiceOfferingHelper.bindTextValues(f, platformConfig)}
                  </Span>
                </HStack>
              )
            })}
          </VStack>
        </VStack>

        <HStack justify='space-between' align='center'>
          <VStack gap='2xs'>
            {config.stringOverrides.priceAmount != '' && <Span size='sm' variant='subtle'>Starting at</Span>}
            <HStack align='baseline'>
              <Span size='xl' weight='bold'>{config.stringOverrides.priceAmount}</Span>
              {config.stringOverrides.priceAmount != '' && (
                <Span variant='subtle'>
                  {config.stringOverrides.priceUnit}
                </Span>
              )}
            </HStack>
          </VStack>

          <Button
            variant='outlined'
            onClick={handleCtaClick}
          >
            {config.cta.primary.label}
          </Button>
        </HStack>
      </VStack>
    </div>
  )
}
