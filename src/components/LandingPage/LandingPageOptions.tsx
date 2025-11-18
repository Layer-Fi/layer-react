import { useCallback, useMemo } from 'react'
import classNames from 'classnames'
import { Check } from 'lucide-react'

import { isCalendlyLink } from '@hooks/useCalendly/useCalendly'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { P, Span } from '@ui/Typography/Text'
import { Badge } from '@components/Badge/Badge'
import { BadgeSize, BadgeVariant } from '@components/Badge/Badge'
import { LandingPageHelper } from '@components/LandingPage/LandingPageHelper'
import { type LandingPageCardConfig, type LandingPagePlatformConfig } from '@components/LandingPage/types'
import { Separator } from '@components/Separator/Separator'
export interface LandingPageOptionsProps {
  type: 'accounting' | 'bookkeeping'
  platformConfig: LandingPagePlatformConfig
  config: LandingPageCardConfig
  openCalendly: (link: string) => void
  className: string
}

export const LandingPageOffer = ({
  type,
  platformConfig,
  config,
  openCalendly,
  className,
}: LandingPageOptionsProps) => {
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
      <VStack pb='lg' pi='lg' gap='md' className='Layer__LandingPage-options__card'>
        <VStack gap='md'>
          <HStack>
            <Badge size={BadgeSize.SMALL} variant={badgeVariant}>
              {LandingPageHelper.bindTextValues(config.stringOverrides.badge, platformConfig)}
            </Badge>
          </HStack>
          <Heading size='sm'>
            {LandingPageHelper.bindTextValues(config.stringOverrides.title, platformConfig)}
          </Heading>
          <P variant='subtle'>
            {LandingPageHelper.bindTextValues(config.stringOverrides.subtitle, platformConfig)}
          </P>
        </VStack>
        <Separator />
        <VStack className='Layer__LandingPage-options__features' gap='sm'>
          <VStack className='Layer__LandingPage-options__features-list' gap='sm'>
            {features.map((f, i) => {
              return (
                <HStack key={i} gap='xs'>
                  <Check size={14} className='Layer__LandingPage-options__feature-check' />
                  <Span size='sm' variant='subtle'>
                    {LandingPageHelper.bindTextValues(f, platformConfig)}
                  </Span>
                </HStack>
              )
            })}
          </VStack>
        </VStack>

        <HStack justify='space-between' align='end'>
          <VStack gap='2xs'>
            {config.showStartingAtLabel && <Span size='sm' variant='subtle'>Starting at</Span>}
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
            variant='solid'
            onClick={handleCtaClick}
          >
            {config.cta.primary.label}
          </Button>
        </HStack>
      </VStack>
    </div>
  )
}
