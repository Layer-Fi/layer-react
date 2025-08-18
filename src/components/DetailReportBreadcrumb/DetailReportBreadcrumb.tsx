import { HeaderCol } from '../Header'
import { Button } from '../ui/Button/Button'
import { Span } from '../ui/Typography/Text'
import { HStack, VStack } from '../ui/Stack/Stack'
import ChevronRight from '../../icons/ChevronRight'

export interface BreadcrumbItem {
  name: string
  display_name: string
}

export interface DetailReportBreadcrumbProps {
  breadcrumbs: BreadcrumbItem[]
  subtitle?: string
  onBreadcrumbClick?: (lineItemName: string) => void
}

export const DetailReportBreadcrumb = ({
  breadcrumbs,
  subtitle,
  onBreadcrumbClick,
}: DetailReportBreadcrumbProps) => {
  return (
    <HeaderCol>
      <HStack align='center' pi='3xs' gap='md'>
        <VStack gap='3xs'>
          <HStack align='center'>
            {breadcrumbs.map((crumb, index) => (
              <HStack key={crumb.name} align='center'>
                {index === breadcrumbs.length - 1
                  ? (
                    <Span>
                      {crumb.display_name}
                    </Span>
                  )
                  : (
                    <Button
                      variant='text'
                      onPress={() => onBreadcrumbClick?.(crumb.name)}
                    >
                      <Span variant='subtle'>{crumb.display_name}</Span>
                    </Button>
                  )}
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight color='currentColor' size={8} />
                )}
              </HStack>
            ))}
          </HStack>
          {subtitle && (
            <Span size='sm' variant='subtle'>
              {subtitle}
            </Span>
          )}
        </VStack>
      </HStack>
    </HeaderCol>
  )
}
