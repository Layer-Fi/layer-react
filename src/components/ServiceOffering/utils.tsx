import { ServiceOfferingContentID, ServiceOfferingTypesTextContent, ServiceOfferingDefaultTextContent } from './content'
import { ServiceOfferingTypesProps } from './ServiceOffering'

export function makeDynamicText(contentId: ServiceOfferingContentID, textContent: ServiceOfferingTypesTextContent, config: ServiceOfferingTypesProps['config']) {
  const variableMap = {
    platformName: config.platform.platformName,
    industry: config.platform.industry,
  }

  // Try to use the provided text content. If it doesn't exist, we'll use values from the default.
  const template = textContent[contentId] ?? ServiceOfferingDefaultTextContent[contentId]

  return template.replace(/{(\w+)}/g, (match, key) => {
    return variableMap[key as keyof typeof variableMap] || match
  })
}
