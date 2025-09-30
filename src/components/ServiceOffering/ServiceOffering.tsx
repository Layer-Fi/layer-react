import classNames from 'classnames'
import { PopupModal } from 'react-calendly'
import { ServiceOfferingOffer } from './ServiceOfferingOptions'
import { Button } from '../ui/Button/Button'
import { Heading } from '../ui/Typography/Heading'
import { HStack, VStack } from '../ui/Stack/Stack'
import { Span } from '../ui/Typography/Text'
import {
  imagePartnerAccountingImage,
} from '../../assets/images'
import { ContentConfig, ServiceOfferingContentID, ServiceOfferingDefaultTextContent, CoreValueProposition } from './content'
import { ServiceOfferingLink, ServiceOfferingPlatformConfig, ServiceOfferingConfig, ServiceOfferingLinks } from './types'
import { ServiceOfferingHelper } from './ServiceOfferingHelper'
import { isCalendlyLink, useCalendly } from './calendly'
import { View } from '../View'

/**
 * This config prepares the ServiceOffering component, enabling you to
 * surface the Layer offerings: accounting and bookkeeping.
 *
 * This is the primary input for a ServiceOffering component.
 */
export type ServiceOfferingMainConfig = {
  /**
   * Allows you to configure the CTAs on the top-of-the-fold section of the
   * service offering page component.
   @see ServiceOfferingLink
   */
  links: ServiceOfferingLinks
  /**
   * Allows you to configure the platform name, industry, and top-of-fold image.
   */
  platform: ServiceOfferingPlatformConfig
  /**
   * Allows you to configure textual and image content relating to the core value proposition
   * and the service offerings.
   *
   * In general, there are 3 content sections on the ServiceOffering page component:
   * (1) Top-of-the-fold main content section,
   * (2) Core value proposition content section,
   * (3) Service offering content section.
   *
   @see ServiceOfferingHelper.createBaseAccountingOffer
   @see ServiceOfferingHelper.createBaseBookkeepingOffer
   @see ServiceOfferingConfig
   */
  content: ContentConfig
}

/**
 * Props for the ServiceOffering component.
 *
 * Requires only a single parameter, which is `config` which holds on to all the customizable
 * settings for the service offering component such as textual content on the accounting and bookkeeping
 * services, with varied pricing options and book-a-call calendly integration.
 */
export interface ServiceOfferingProps {
  config: ServiceOfferingMainConfig
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
  config: mainConfig,
}: ServiceOfferingProps) => {
  const {
    links,
    platform: { platformName, imageUrl, industry },
    content: {
      textContent = ServiceOfferingDefaultTextContent,
      layout: offersPosition = 'none',
      features,
    },
  } = mainConfig
  const { isCalendlyVisible, calendlyLink, calendlyRef, openCalendly, closeCalendly } = useCalendly()

  const baseClassName = classNames(
    'Layer__service-offering',
    {
      'Layer__service-offering--with-left-offers': offersPosition === 'left',
      'Layer__service-offering--with-right-offers': offersPosition === 'right',
      'Layer__service-offering--with-bottom-offers': offersPosition === 'bottom',
    },
  )

  const handleLinkClick = (link?: ServiceOfferingLink) => {
    if (isCalendlyLink(link)) {
      openCalendly(link!.url)
    }
    else if (link) {
      window.open(link.url, '_blank')
    }
  }

  const handleMainCta = () => handleLinkClick(links.main)

  const handleLearnMore = () => {
    if (links.learnMore) window.open(links.learnMore.url, '_blank')
  }

  const renderOffer = (offer: ServiceOfferingConfig) => {
    if (offersPosition === 'none') return null
    return (
      <ServiceOfferingOffer
        key={offer.title}
        config={offer}
        openCalendly={openCalendly}
        platformConfig={mainConfig.platform}
        className='Layer__service-offering__offers'
      />
    )
  }
  const renderMainContent = () => (
    <VStack className='Layer__service-offering--main'>
      <div className='Layer__service-offering__responsive-layout'>
        <VStack gap='2xl' className='Layer__service-offering__responsive-content'>
          <VStack>
            {!!textContent[ServiceOfferingContentID.title] === false && (
              <>
                <Heading size='3xl'>
                  {platformName}
                  <br />
                </Heading>
                <Heading size='3xl' variant='subtle' weight='normal'>Accounting</Heading>
              </>
            )}
            {textContent[ServiceOfferingContentID.title] != '' && (
              <>
                <Heading size='3xl'>
                  {ServiceOfferingHelper.makeDynamicText(ServiceOfferingContentID.title, textContent, mainConfig)}
                </Heading>
              </>
            )}
          </VStack>
          <Heading size='md'>
            {ServiceOfferingHelper.makeDynamicText(ServiceOfferingContentID.subtitle, textContent, mainConfig)}
          </Heading>
          <VStack>
            {(features ?? []).map((feature: CoreValueProposition, index) => (
              <HStack gap='lg' key={index} pb='xs'>
                <HStack pb='sm'>
                  {feature.icon}
                </HStack>
                <VStack pb='xs'>
                  <Heading size='lg'>
                    {feature.title.replaceAll('{industry}', industry).replaceAll('{platformName}', platformName)}
                  </Heading>
                  <Span size='md' variant='subtle'>
                    {feature.text.replaceAll('{industry}', industry).replaceAll('{platformName}', platformName)}
                  </Span>
                </VStack>
              </HStack>
            ))}
          </VStack>
          <HStack gap='sm' justify='start' className={classNames({ hiding: isCalendlyVisible })}>
            {links.learnMore && <Button variant='outlined' onClick={handleLearnMore}>{links.learnMore.label}</Button>}
            <Button variant='branded' onClick={handleMainCta}>{links.main.label}</Button>
          </HStack>
        </VStack>
        <VStack className='Layer__service-offering__responsive-image'>
          <img src={imageUrl || imagePartnerAccountingImage} alt={`${platformName} Accounting dashboard interface showing financial data and business insights`} />
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
      <VStack gap='3xl' pb='2xl'>
        <Heading size='lg' align='center'>
          {ServiceOfferingHelper.makeDynamicText(ServiceOfferingContentID.value_proposition_title, textContent, mainConfig)}
        </Heading>
        <div className='Layer__service-offering__value-props-responsive'>
          {mainConfig.content.config.flatMap(c =>
            c.valueProposition.map((valueProp, index) => (
              <VStack key={`${c.title}-${index}`} className='Layer__feature-card'>
                {valueProp.icon}
                <VStack pb='2xl' pi='2xl'>
                  <Heading size='md'>
                    {valueProp.title}
                  </Heading>
                  <Span variant='subtle'>
                    {valueProp.text}
                  </Span>
                </VStack>
              </VStack>
            )),
          )}
        </div>
      </VStack>

    </VStack>
  )

  return (
    <View viewClassName={baseClassName} showHeader={false}>
      <div className='Layer__service-offering__content'>
        {renderMainContent()}
        <VStack gap='3xl' className='Layer__service-offering--offers'>
          <HStack align='center'>
            <Heading size='md' align='center' style={{ maxWidth: '480px', margin: '0 auto' }}>
              {ServiceOfferingHelper.makeDynamicText(ServiceOfferingContentID.offers_title, textContent, mainConfig)}
            </Heading>
          </HStack>
          <div className='Layer__service-offering-options__grid'>
            {mainConfig.content.config.map(renderOffer)}
          </div>
        </VStack>
      </div>
    </View>
  )
}
