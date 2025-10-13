import { HStack } from '../ui/Stack/Stack'
import { Button } from '../ui/Button/Button'
import { Span } from '../ui/Typography/Text'
import { X } from 'lucide-react'

interface ClearButtonProps {
  onClick: () => void
}

interface ConfirmButtonProps {
  onClick: () => void
  isDisabled?: boolean
  label?: string
}

interface BulkActionsHeaderProps {
  selectedCount: number
  slotProps?: {
    ClearButton?: ClearButtonProps
    ConfirmButton?: ConfirmButtonProps
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
  const { ClearButton, ConfirmButton } = slotProps

  return (
    <HStack justify='space-between' align='center' gap='xs'>
      <HStack align='center' gap='sm'>
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
          <>
            <div className='Layer__bulk-actions-header__divider' />
            <Actions />
          </>
        )}
      </HStack>

      {ConfirmButton && (
        <div className='Layer__bulk-actions-header__confirm-button'>
          <Button
            variant='solid'
            onClick={ConfirmButton.onClick}
            isDisabled={ConfirmButton.isDisabled}
          >
            {ConfirmButton.label || 'Apply'}
          </Button>
        </div>
      )}
    </HStack>
  )
}
