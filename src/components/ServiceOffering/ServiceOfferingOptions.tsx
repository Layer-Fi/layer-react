import { HTMLAttributes } from 'react'
import { Button } from '../ui/Button/Button'
import { P, Span } from '../ui/Typography/Text'
import { HStack, VStack } from '../ui/Stack/Stack'
import { Heading } from '../ui/Typography/Heading'
import { Badge } from '../Badge'
import { BadgeSize, BadgeVariant } from '../Badge/Badge'
import { ServiceOfferingPlatformConfig, ServiceOfferingConfig } from './types'
import { isCalendlyLink } from './calendly'
import { ServiceOfferingHelper } from './ServiceOfferingHelper'

export interface ServiceOfferingOptionsProps extends HTMLAttributes<HTMLDivElement> {
  platformConfig: ServiceOfferingPlatformConfig
  config: ServiceOfferingConfig
  openCalendly: (link: string) => void
}

export const ServiceOfferingOffer = ({
  platformConfig,
  config,
  openCalendly,
  ...props
}: ServiceOfferingOptionsProps) => {
  const handleCtaClick = () => {
    if (isCalendlyLink(config.cta)) {
      openCalendly(config.cta.url)
    }
    else {
      window.open(config.cta.url, '_blank')
    }
  }
  return (
    <div className='Layer__service-offering-options__grid' {...props}>
      <VStack pb='lg' pi='lg' gap='2xl' className='Layer__service-offering-options__card'>
        <VStack gap='md'>
          <HStack>
            <Badge size={BadgeSize.SMALL} variant={BadgeVariant.DEFAULT}>
              {ServiceOfferingHelper.bindTextValues(config.badge, platformConfig)}
            </Badge>
          </HStack>
          <Heading size='sm'>
            {ServiceOfferingHelper.bindTextValues(config.title, platformConfig)}
          </Heading>
          <P variant='subtle'>
            {ServiceOfferingHelper.bindTextValues(config.description, platformConfig)}
          </P>
        </VStack>

        <VStack className='Layer__service-offering-options__features' gap='sm'>
          <Heading size='xs' weight='normal' variant='subtle'>Features</Heading>
          <VStack className='Layer__service-offering-options__features-list'>
            {config.features.map((f, i) => {
              if (typeof f == 'string') {
                return (
                  <HStack key={i} gap='xs'>
                    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' className='Layer__service-offering-options__icon'>
                      <path d='M14.375 3.92334L8.4375 9.86084L5.3125 6.73584L0.625 11.4233M14.375 3.92334H10.625M14.375 3.92334V7.67334' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                    <Span size='sm' variant='subtle'>
                      {ServiceOfferingHelper.bindTextValues(f, platformConfig)}
                    </Span>
                  </HStack>
                )
              }

              return (
                <HStack key={i} gap='xs'>
                  {f.icon}
                  <Span size='sm' variant='subtle'>
                    {ServiceOfferingHelper.bindTextValues(f.description, platformConfig)}
                  </Span>
                </HStack>
              )
            })}
          </VStack>
        </VStack>

        <HStack justify='space-between' align='center'>
          <VStack gap='2xs'>
            {config.pricing != '' && <Span size='sm' variant='subtle'>Starting at</Span>}
            <HStack align='baseline'>
              <Span size='xl' weight='bold'>{config.pricing}</Span>
              {config.pricing != '' && (
                <Span variant='subtle'>
                  {config.unit}
                </Span>
              )}
            </HStack>
          </VStack>

          <Button
            variant='outlined'
            onClick={handleCtaClick}
          >
            {config.cta.label}
          </Button>
        </HStack>
      </VStack>
    </div>
  )
}
