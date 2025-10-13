import { HStack } from '../ui/Stack/Stack'
import { Button } from '../ui/Button/Button'
import { Span } from '../ui/Typography/Text'
import { X } from 'lucide-react'

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
      <HStack
        align='center'
        gap='md'
        className='Layer__bulk-actions-header__selection-info'
      >
        <Span weight='bold' size='md'>
          {selectedCount}
          {' '}
          {selectedCount === 1 ? 'item' : 'items'}
          {' '}
          selected
        </Span>
        {ClearButton && (
          <Button
            variant='text'
            onClick={ClearButton.onClick}
            aria-label='Cancel bulk actions'
            style={{ marginTop: '2px' }}
          >
            <X size={20} />
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
