import { HTMLAttributes } from 'react'
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
import { Link, PlatformConfig, ServiceOfferingConfig, ServiceOfferingLinks } from './types'
import { makeDynamicText } from './utils'
import { isCalendlyLink, useCalendly } from './calendly'

export type ServiceOfferingMainConfig = {
  /** Link configuration for various CTAs and actions */
  links: ServiceOfferingLinks
  /** Platform-specific branding and customization settings */
  platform: PlatformConfig
  /** Content configuration for service offerings and pricing */
  content: ContentConfig
}

/**
   * Props for the ServiceOffering component - a customizable landing page component
   * that showcases accounting services with optional pricing options and booking integration.
   */
export interface ServiceOfferingTypesProps extends HTMLAttributes<HTMLDivElement> {
  config: ServiceOfferingMainConfig
}

export const ServiceOffering = ({
  config: mainConfig,
  ...props
}: ServiceOfferingTypesProps) => {
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

  const handleLinkClick = (link?: Link) => {
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
                  {makeDynamicText(ServiceOfferingContentID.title, textContent, mainConfig)}
                </Heading>
              </>
            )}
          </VStack>
          <Heading size='md'>
            {makeDynamicText(ServiceOfferingContentID.subtitle, textContent, mainConfig)}
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
                  <Span size='md' variant='subtle' lineHeight='lg'>
                    {feature.text.replaceAll('{industry}', industry).replaceAll('{platformName}', platformName)}
                  </Span>
                </VStack>
              </HStack>
            ))}
          </VStack>
          <HStack gap='sm' justify='start' className={classNames({ hiding: isCalendlyVisible })}>
            {links.learnMore && <Button rounded='md' variant='outlined' onClick={handleLearnMore}>{links.learnMore.label}</Button>}
            <Button rounded='md' variant='branded' onClick={handleMainCta}>{links.main.label}</Button>
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
      <VStack gap='3xl' pb='5xl'>
        <Heading size='lg' align='center'>
          {makeDynamicText(ServiceOfferingContentID.value_proposition_title, textContent, mainConfig)}
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
                  <Span variant='subtle' lineHeight='xl'>
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
    <VStack className={baseClassName} {...props}>
      <div className='Layer__service-offering__content'>
        {renderMainContent()}
        <VStack gap='3xl' {...props} className='Layer__service-offering--offers'>
          <HStack align='center'>
            <Heading size='md' align='center' style={{ maxWidth: '360px', margin: '0 auto' }}>
              {makeDynamicText(ServiceOfferingContentID.offers_title, textContent, mainConfig)}
            </Heading>
          </HStack>
          {mainConfig.content.config.map(renderOffer)}
        </VStack>
      </div>
    </VStack>
  )
}
