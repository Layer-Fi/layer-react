import { ChevronRight } from 'lucide-react'

import type { BreadcrumbItem } from '@internal-types/features/profitAndLoss/profitAndLoss'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

export type { BreadcrumbItem }

export interface ProfitAndLossDetailReportBreadcrumbProps {
  breadcrumbs: BreadcrumbItem[]
  subtitle?: string
  onBreadcrumbClick?: (lineItemName: string) => void
}

export const ProfitAndLossDetailReportBreadcrumb = ({
  breadcrumbs,
  subtitle,
  onBreadcrumbClick,
}: ProfitAndLossDetailReportBreadcrumbProps) => {
  return (
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
                <ChevronRight color='currentColor' size={18} strokeWidth={1.5} />
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
  )
}
