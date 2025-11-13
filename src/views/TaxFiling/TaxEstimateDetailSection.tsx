import { useState, ReactNode, useEffect } from 'react'
import { VStack, HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { ChevronDown } from 'lucide-react'
import { convertNumberToCurrency } from '@utils/format'
import './taxEstimate.scss'

interface TaxEstimateDetailSectionProps {
  title: string
  children: ReactNode
  headerActions?: ReactNode
  totalAmount?: number
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}

export const TaxEstimateDetailSection = ({
  title,
  children,
  headerActions,
  totalAmount,
  expanded: controlledExpanded,
  onExpandedChange,
}: TaxEstimateDetailSectionProps) => {
  const [internalExpanded, setInternalExpanded] = useState(false)
  const isControlled = controlledExpanded !== undefined
  const isExpanded = isControlled ? controlledExpanded : internalExpanded

  useEffect(() => {
    if (isControlled && controlledExpanded !== undefined) {
      setInternalExpanded(controlledExpanded)
    }
  }, [controlledExpanded, isControlled])

  const handleToggle = () => {
    const newExpanded = !isExpanded
    if (isControlled && onExpandedChange) {
      onExpandedChange(newExpanded)
    }
    else {
      setInternalExpanded(newExpanded)
    }
  }

  return (
    <VStack gap='sm' fluid>
      <div
        className='Layer__tax-estimate__section-item'
        onClick={handleToggle}
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
          <HStack gap='md' align='center'>
            {!isExpanded && totalAmount !== undefined && (
              <Span size='xl' weight='bold'>
                {convertNumberToCurrency(totalAmount)}
              </Span>
            )}
            {headerActions && (
              <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                {headerActions}
              </div>
            )}
          </HStack>
        </HStack>
      </div>
      {isExpanded && (
        <VStack gap='sm' fluid pbs='lg' pbe='lg' pis='lg' pie='lg'>
          {children}
        </VStack>
      )}
    </VStack>
  )
}
