import { useState, ReactNode } from 'react'
import { VStack, HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { ChevronDown } from 'lucide-react'
import './taxEstimate.scss'

interface TaxEstimateDetailSectionProps {
  title: string
  children: ReactNode
  headerActions?: ReactNode
}

export const TaxEstimateDetailSection = ({
  title,
  children,
  headerActions,
}: TaxEstimateDetailSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <VStack gap='sm' fluid>
      <div
        className='Layer__tax-estimate__section-item'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <HStack
          justify='space-between'
          align='center'
          fluid
        >
          <HStack gap='md' align='center'>
            <ChevronDown
              size={24}
              fontWeight='bold'
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
            <Span size='xl' weight='bold'>{title}</Span>
          </HStack>
          {headerActions && (
            <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              {headerActions}
            </div>
          )}
        </HStack>
      </div>
      {isExpanded && (
        <VStack gap='sm' fluid className='Layer__tax-estimate__section-content'>
          {children}
        </VStack>
      )}
    </VStack>
  )
}
