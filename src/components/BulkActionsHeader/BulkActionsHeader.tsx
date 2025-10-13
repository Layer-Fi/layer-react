import { HStack } from '../ui/Stack/Stack'
import { Button } from '../ui/Button/Button'
import { Span } from '../ui/Typography/Text'
import { X } from 'lucide-react'
import './bulkActionsHeader.scss'

interface ClearButtonProps {
  onClick: () => void
}

interface BulkActionsHeaderProps {
  selectedCount: number
  slotProps?: {
    ClearButton?: ClearButtonProps
  }
  slots?: {
    Actions?: React.FC
  }
}

export const BulkActionsHeader = ({
  selectedCount,
  slotProps = {},
  slots = {},
}: BulkActionsHeaderProps) => {
  const { Actions } = slots
  const { ClearButton } = slotProps

  return (
    <HStack justify='space-between' align='center' gap='xs'>
      <HStack justify='space-between' align='center' className='Layer__bulk-actions-header__selection-container'>
        <Span>
          {selectedCount}
          {' '}
          item(s) selected
        </Span>
        {ClearButton && (
          <Button
            variant='ghost'
            icon
            onClick={ClearButton.onClick}
            aria-label='Cancel bulk actions'
          >
            <X size={16} />
          </Button>
        )}
      </HStack>

      {Actions && (
        <HStack align='center' gap='sm'>
          <Actions />
        </HStack>
      )}
    </HStack>
  )
}
