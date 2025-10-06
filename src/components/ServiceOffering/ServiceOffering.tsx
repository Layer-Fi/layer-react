import { useMemo, useCallback } from 'react'
import classNames from 'classnames'
import { PopupModal } from 'react-calendly'
import { ServiceOfferingOffer } from './ServiceOfferingOptions'
import { ServiceOfferingCarousel } from './ServiceOfferingCarousel'
import { Button } from '../ui/Button/Button'
import { Heading } from '../ui/Typography/Heading'
import { HStack, VStack } from '../ui/Stack/Stack'
import { Span } from '../ui/Typography/Text'

import { DefaultHeroContentConfig, DefaultAccountingOfferingContentConfig, DefaultBookkeepingOfferingContentConfig, ServiceOfferingDefaultTextContent, ServiceOfferingContentID } from './content'
import { HeroContentConfigOverrides, ServiceOfferingConfigOverrides, ServiceOfferingLink, ServiceOfferingPlatformConfig, ServiceOfferingType } from './types'
import { ServiceOfferingHelper } from './ServiceOfferingHelper'
import { isCalendlyLink, useCalendly } from './calendly'
import { View } from '../View'
import { imageBookkeeperInquiries, imageBusinessAccounts, imageBusinessOverview, imageCategorizeExpenses, imagePnlOverview, imageScheduleBookkeeperMeeting } from '../../assets/images'
import { useSizeClass } from '../../hooks/useWindowSize'
import { mergeHeroContentOverrides, mergeServiceOfferingOverrides } from './utils'

const featureCards = [
  {
    image: imageBusinessAccounts,
    title: 'Connect your business accounts',
    description: 'Connect your business bank accounts and credit cards right within {platformName}',
  },
  {
    image: imageBusinessOverview,
    title: 'Categorize expenses',
    description: 'Organize transactions into categories built for {industry}',
  },
  {
    image: imageCategorizeExpenses,
    title: 'Get a clear picture of your business',
    description: 'See your business profitability and stay organized for tax time',
  },
]

const bookkeepingFeatureCards = [
  {
    image: imageScheduleBookkeeperMeeting,
    title: 'Schedule a call with your Bookkeeper',
    description: 'Get personalized guidance from your dedicated bookkeeper to review your finances and answer questions.',
  },
  {
    image: imageBookkeeperInquiries,
    title: 'Get notified on bookkeeping clarifications',
    description: 'Receive clear notifications when your bookkeeper needs additional information or clarification on transactions.',
  },
  {
    image: imagePnlOverview,
    title: 'Get ready for tax season',
    description: 'Your books will be organized and tax-ready with accurate categorization and financial statements prepared by professionals.',
  },
]

/**
 * Props for the ServiceOffering component.
 *
 * Requires only a single parameter, which is `config` which holds on to all the customizable
 * settings for the service offering component such as textual content on the accounting and bookkeeping
 * services, with varied pricing options and book-a-call calendly integration.
 */
export interface ServiceOfferingProps {
  platform: ServiceOfferingPlatformConfig
  availableOffers: ServiceOfferingType[]
  heroOverrides: HeroContentConfigOverrides
  offeringOverrides: {
    stringOverrides?: {
      sectionTitle: string
    }
    accounting: ServiceOfferingConfigOverrides
    bookkeeping: ServiceOfferingConfigOverrides
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
  const { isDesktop } = useSizeClass()
  const isMobile = !isDesktop

  const hasAccountingEnabled = availableOffers.includes('accounting')
  const hasBookkeepingEnabled = availableOffers.includes('bookkeeping')

  const heroConfig = mergeHeroContentOverrides(DefaultHeroContentConfig, heroOverrides)
  const offeringSectionTitle = offeringOverrides.stringOverrides?.sectionTitle ?? ServiceOfferingDefaultTextContent[ServiceOfferingContentID.offersTitle]
  const accountingOfferingConfig = mergeServiceOfferingOverrides(DefaultAccountingOfferingContentConfig, offeringOverrides.accounting)
  const bookkeepingOfferingConfig = mergeServiceOfferingOverrides(DefaultBookkeepingOfferingContentConfig, offeringOverrides.bookkeeping)

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

  const renderFeatureCard = useCallback((card: typeof featureCards[0], index: number, platform: ServiceOfferingPlatformConfig) => (
    <VStack key={index} className='Layer__feature-card'>
      <div className='img-container'>
        <img src={card.image} alt={card.title} />
      </div>
      <VStack gap='md'>
        <Heading size='md'>
          {ServiceOfferingHelper.bindTextValues(card.title, platform)}
        </Heading>
        <Span variant='subtle'>
          {ServiceOfferingHelper.bindTextValues(card.description, platform)}
        </Span>
      </VStack>
    </VStack>
  ), [])

  const renderMainContent = useCallback(() => (
    <VStack className='Layer__service-offering--main'>
      <div className='Layer__service-offering__responsive-layout'>
        <VStack gap='2xl' className='Layer__service-offering__responsive-content'>
          <VStack>
            {!!heroConfig.stringOverrides?.title === false && (
              <>
                <Heading size='3xl'>
                  {platform.platformName}
                  <br />
                </Heading>
                <Heading size='3xl' variant='subtle' weight='normal'>Accounting</Heading>
              </>
            )}
            {heroConfig.stringOverrides?.title != '' && (
              <>
                <Heading size='3xl'>
                  {ServiceOfferingHelper.bindTextValues(heroConfig.stringOverrides.title, platform)}
                </Heading>
              </>
            )}
          </VStack>
          <Heading size='md'>
            {ServiceOfferingHelper.bindTextValues(heroConfig.stringOverrides.subtitle, platform)}
          </Heading>
          <VStack>
            <HStack gap='lg' pb='xs'>
              <VStack pb='xs'>
                <Heading size='lg'>
                  {ServiceOfferingHelper.bindTextValues(heroConfig.stringOverrides.heading1, platform)}
                </Heading>
                <Span size='md' variant='subtle'>
                  {ServiceOfferingHelper.bindTextValues(heroConfig.stringOverrides.heading1Desc, platform)}
                </Span>
              </VStack>
            </HStack>
            <HStack gap='lg' pb='xs'>
              <VStack pb='xs'>
                <Heading size='lg'>
                  {ServiceOfferingHelper.bindTextValues(heroConfig.stringOverrides.heading2, platform)}
                </Heading>
                <Span size='md' variant='subtle'>
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
        <VStack className='Layer__service-offering__responsive-image'>
          <img src={heroConfig.mediaUrls.top_of_fold_image} alt={`${platform.platformName} Accounting dashboard interface showing financial data and business insights`} />
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
            rootElement={document.getElementById('root')!}
          />
        </HStack>
      )}
    </VStack>
  ), [platform, heroConfig, isCalendlyVisible, calendlyLink, calendlyRef, closeCalendly, handleLearnMore, handleMainCta])

  const RenderCarousel = useMemo(() => {
    if (isMobile) {
      // Mobile: Simple scrollable list (no carousel)
      return (
        <VStack gap='5xl' pb='2xl' align='center'>
          {/* Accounting Section */}
          <VStack gap='lg' className='Layer__mobile-feature-section'>
            <Heading size='lg' align='center'>
              {ServiceOfferingHelper.bindTextValues(
                'The easiest way to manage your business finances',
                platform,
              )}
            </Heading>
            <VStack gap='md'>
              {featureCards.map((card, index) => renderFeatureCard(card, index, platform))}
            </VStack>
          </VStack>

          {/* Bookkeeping Section */}
          <VStack gap='lg' className='Layer__mobile-feature-section'>
            <Heading size='lg' align='center'>
              {ServiceOfferingHelper.bindTextValues(
                'Professional bookkeeping services',
                platform,
              )}
            </Heading>
            <VStack gap='lg'>
              {bookkeepingFeatureCards.map((card, index) => renderFeatureCard(card, index, platform))}
            </VStack>
          </VStack>
        </VStack>
      )
    }

    // Desktop: 1 carousel with 2 slides, each showing all 3 cards
    return (
      <VStack gap='3xl' pb='2xl' align='center'>
        <ServiceOfferingCarousel>
          <VStack gap='lg'>
            <Heading size='lg' align='center'>
              {ServiceOfferingHelper.bindTextValues(
                'The easiest way to manage your business finances',
                platform,
              )}
            </Heading>
            <HStack>
              {featureCards.map((card, index) => renderFeatureCard(card, index, platform))}
            </HStack>
          </VStack>
          <VStack gap='lg'>
            <Heading size='lg' align='center'>
              {ServiceOfferingHelper.bindTextValues(
                'Professional bookkeeping services',
                platform,
              )}
            </Heading>
            <HStack gap='lg'>
              {bookkeepingFeatureCards.map((card, index) => renderFeatureCard(card, index, platform))}
            </HStack>
          </VStack>
        </ServiceOfferingCarousel>
      </VStack>
    )
  }, [isMobile, platform, renderFeatureCard])

  const RenderOffers = useMemo(() => (
    <VStack gap='3xl' className='Layer__service-offering--offers'>
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
  [hasAccountingEnabled, hasBookkeepingEnabled, offeringSectionTitle, platform, accountingOfferingConfig, bookkeepingOfferingConfig, openCalendly],
  )

  return (
    <View viewClassName={baseClassName} showHeader={false}>
      <div className='Layer__service-offering__content'>
        {renderMainContent()}
        {RenderOffers}
        {RenderCarousel}
      </div>
    </View>
  )
}
