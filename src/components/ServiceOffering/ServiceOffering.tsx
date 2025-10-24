import { useMemo, useCallback } from 'react'
import classNames from 'classnames'
import { PopupModal } from 'react-calendly'
import { ServiceOfferingOffer } from './ServiceOfferingOptions'
import { Button } from '../ui/Button/Button'
import { Heading } from '../ui/Typography/Heading'
import { HStack, VStack } from '../ui/Stack/Stack'
import { Span } from '../ui/Typography/Text'

import { DefaultHeroContentConfig, DefaultAccountingOfferingConfig, DefaultBookkeepingOfferingConfig, ServiceOfferingDefaultTextContent, ServiceOfferingContentID } from './content'
import { HeroContentConfig, ServiceOfferingCardConfig, DeepPartial, ServiceOfferingLink, ServiceOfferingPlatformConfig } from './types'
import { ServiceOfferingHelper } from './ServiceOfferingHelper'
import { isCalendlyLink, useCalendly } from '../../hooks/useCalendly/useCalendly'
import { View } from '../View'
import { mergeHeroContentConfig, mergeServiceOfferingConfig } from './utils'
import { useSizeClass, useWindowSize } from '../../hooks/useWindowSize/useWindowSize'
import './serviceOffering.scss'

/**
 * Props for the ServiceOffering component.
 *
 * Requires only a single parameter, which is `config` which holds on to all the customizable
 * settings for the service offering component such as textual content on the accounting and bookkeeping
 * services, with varied pricing options and book-a-call calendly integration.
 */
export interface ServiceOfferingProps {
  platform: ServiceOfferingPlatformConfig
  availableOffers: ('accounting' | 'bookkeeping')[]
  heroOverrides: DeepPartial<HeroContentConfig>
  offeringOverrides: {
    stringOverrides?: {
      sectionTitle: string
    }
    accounting: DeepPartial<ServiceOfferingCardConfig>
    bookkeeping: DeepPartial<ServiceOfferingCardConfig>
  }
}

/**
 * The ServiceOffering component provides a page-level component that surfaces the Layer accounting
 * and bookkeeping services. It acts as a landing page allowing platforms to showcase the core value proposition
 * and offers/pricing for the platform's end users.
 @see ServiceOfferingMainConfig
 @param config Allows you to customize the page component.
 @returns A React JSX component
 */
export const ServiceOffering = ({
  platform,
  availableOffers,
  heroOverrides,
  offeringOverrides,
}: ServiceOfferingProps) => {
  const { isCalendlyVisible, calendlyLink, calendlyRef, openCalendly, closeCalendly } = useCalendly()
  const { isMobile } = useSizeClass()
  const [width] = useWindowSize()

  // Track layout mode to re-trigger image animation when it changes
  const isStackedLayout = width <= 1440

  const hasAccountingEnabled = availableOffers.includes('accounting')
  const hasBookkeepingEnabled = availableOffers.includes('bookkeeping')

  const heroConfig = mergeHeroContentConfig(DefaultHeroContentConfig, heroOverrides)
  const offeringSectionTitle = offeringOverrides.stringOverrides?.sectionTitle ?? ServiceOfferingDefaultTextContent[ServiceOfferingContentID.offersTitle]
  const accountingOfferingConfig = mergeServiceOfferingConfig(DefaultAccountingOfferingConfig, offeringOverrides.accounting)
  const bookkeepingOfferingConfig = mergeServiceOfferingConfig(DefaultBookkeepingOfferingConfig, offeringOverrides.bookkeeping)

  const baseClassName = classNames(
    'Layer__service-offering',
    'Layer__service-offering--with-top-offers',
  )

  const handleLinkClick = useCallback((link?: ServiceOfferingLink) => {
    if (isCalendlyLink(link)) {
      openCalendly(link!.url)
    }
    else if (link) {
      window.open(link.url, '_blank')
    }
  }, [openCalendly])

  const handleMainCta = useCallback(() => handleLinkClick(heroConfig.cta?.primary), [heroConfig.cta?.primary, handleLinkClick])

  const handleLearnMore = useCallback(() => {
    if (heroConfig.cta?.secondary) window.open(heroConfig.cta?.secondary.url, '_blank')
  }, [heroConfig.cta?.secondary])

  const renderMainContent = useCallback(() => (
    <VStack className='Layer__service-offering--main'>
      <div className='Layer__service-offering__layout'>
        <VStack gap={isMobile ? 'md' : 'lg'} pi={isMobile ? 'md' : 'lg'} className='Layer__service-offering__responsive-content'>
          <VStack>
            {!!heroConfig.stringOverrides?.title === false && (
              <>
                <Heading size={isMobile ? 'xl' : '3xl'}>
                  {platform.platformName}
                  <br />
                </Heading>
                <Heading size={isMobile ? 'xl' : '3xl'} variant='subtle' weight='normal'>Accounting</Heading>
              </>
            )}
            {heroConfig.stringOverrides?.title != '' && (
              <>
                <Heading size={isMobile ? 'xl' : '3xl'}>
                  {ServiceOfferingHelper.bindTextValues(heroConfig.stringOverrides.title, platform)}
                </Heading>
              </>
            )}
          </VStack>
          <Heading variant='subtle' size={isMobile ? 'sm' : 'md'}>
            {ServiceOfferingHelper.bindTextValues(heroConfig.stringOverrides.subtitle, platform)}
          </Heading>
          <VStack>
            <HStack gap='lg' pb={isMobile ? '3xs' : 'xs'}>
              <VStack gap='xs'>
                <Heading size={isMobile ? 'md' : 'lg'}>
                  {ServiceOfferingHelper.bindTextValues(heroConfig.stringOverrides.heading1, platform)}
                </Heading>
                <Span size={isMobile ? 'sm' : 'md'} variant='subtle'>
                  {ServiceOfferingHelper.bindTextValues(heroConfig.stringOverrides.heading1Desc, platform)}
                </Span>
              </VStack>
            </HStack>
            <HStack gap='lg' pb='xs'>
              <VStack gap='xs'>
                <Heading size={isMobile ? 'md' : 'lg'}>
                  {ServiceOfferingHelper.bindTextValues(heroConfig.stringOverrides.heading2, platform)}
                </Heading>
                <Span size={isMobile ? 'sm' : 'md'} variant='subtle'>
                  {ServiceOfferingHelper.bindTextValues(heroConfig.stringOverrides.heading2Desc, platform)}
                </Span>
              </VStack>
            </HStack>
          </VStack>
          <HStack gap='sm' justify='start' className={classNames({ hiding: isCalendlyVisible })}>
            {heroConfig.cta.secondary && <Button variant='outlined' onClick={handleLearnMore}>{heroConfig.cta.secondary.label}</Button>}
            <Button variant='branded' onClick={handleMainCta}>{heroConfig.cta.primary.label}</Button>
          </HStack>
        </VStack>
        <VStack className='Layer__service-offering__media-container'>
          <img
            className='Layer__service-offering__media-image'
            key={`hero-image-${isStackedLayout}`}
            src={heroConfig.mediaUrls.topOfFoldImage}
            alt={`${platform.platformName} Accounting dashboard interface showing financial data and business insights`}
          />
        </VStack>
      </div>
      {isCalendlyVisible && (
        <HStack
          ref={calendlyRef}
          className={classNames('Layer__service-offering__calendly-container', { visible: isCalendlyVisible },
          )}
        >
          <PopupModal
            url={calendlyLink}
            onModalClose={closeCalendly}
            open={isCalendlyVisible}
            rootElement={document.body}
            LoadingSpinner={() => <></>}
          />
        </HStack>
      )}
    </VStack>
  ), [platform, heroConfig, isCalendlyVisible, calendlyLink, calendlyRef, closeCalendly, handleLearnMore, handleMainCta, isMobile, isStackedLayout])

  const RenderOffers = useMemo(() => (
    <VStack gap={isMobile ? 'lg' : '2xl'} className='Layer__service-offering--offers'>
      <HStack align='center'>
        <Heading size='md' align='center' style={{ maxWidth: '480px', margin: '0 auto' }}>
          {ServiceOfferingHelper.bindTextValues(offeringSectionTitle, platform)}
        </Heading>
      </HStack>
      <div className='Layer__service-offering-options__grid'>
        { hasAccountingEnabled && (
          <ServiceOfferingOffer
            type='accounting'
            config={accountingOfferingConfig}
            openCalendly={openCalendly}
            platformConfig={platform}
            className='Layer__service-offering__offers'
          />
        )}
        { hasBookkeepingEnabled && (
          <ServiceOfferingOffer
            type='bookkeeping'
            config={bookkeepingOfferingConfig}
            openCalendly={openCalendly}
            platformConfig={platform}
            className='Layer__service-offering__offers'
          />
        )}
      </div>
    </VStack>
  ),
  [hasAccountingEnabled, hasBookkeepingEnabled, offeringSectionTitle, platform, accountingOfferingConfig, bookkeepingOfferingConfig, openCalendly, isMobile],
  )

  return (
    <View viewClassName={baseClassName} showHeader={false}>
      <div className='Layer__service-offering__content'>
        {renderMainContent()}
        {RenderOffers}
        {/* {RenderCarousel} */}
      </div>
    </View>
  )
}
