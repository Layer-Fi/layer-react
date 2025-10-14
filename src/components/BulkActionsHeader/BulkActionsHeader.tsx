import { HStack } from '../ui/Stack/Stack'
import { Button } from '../ui/Button/Button'
import { Span } from '../ui/Typography/Text'
import { X } from 'lucide-react'
import './bulkActionsHeader.scss'

interface BulkActionsHeaderProps {
  selectedCount: number
  onClear?: () => void
  actions?: React.ReactNode
}

export const BulkActionsHeader = ({
  selectedCount,
  onClear,
  actions,
}: BulkActionsHeaderProps) => {
  return (
    <HStack justify='space-between' align='center' gap='xs'>
      <HStack justify='space-between' align='center' gap='xs' pie='3xs' pis='xs' className='Layer__bulk-actions-header__selection-container'>
        <Span>
          {selectedCount}
          {' '}
          item(s) selected
        </Span>
        {onClear && (
          <Button
            variant='ghost'
            icon
            inset
            onClick={onClear}
            aria-label='Cancel bulk actions'
          >
            <X size={16} />
          </Button>
        )}
      </HStack>

      {actions && (
        <HStack align='center' gap='sm'>
          {actions}
        </HStack>
      )}
    </HStack>
  )
}
