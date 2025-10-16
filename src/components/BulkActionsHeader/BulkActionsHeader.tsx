import pluralize from 'pluralize'
import { HStack } from '../ui/Stack/Stack'
import { Button } from '../ui/Button/Button'
import { Span } from '../ui/Typography/Text'
import './bulkActionsHeader.scss'

interface CountProps {
  showCount?: true
  totalCount?: number
}
interface ClearSelectionButtonProps {
  onClick: () => void
}

interface BulkActionsHeaderProps {
  count?: CountProps
  slotProps?: {
    ClearSelectionButton?: ClearSelectionButtonProps
  }
  slots: {
    Actions: React.FC
  }
}

export const BulkActionsHeader = ({ count, slotProps = {}, slots }: BulkActionsHeaderProps) => {
  const { showCount, totalCount } = count ?? {}
  const { Actions } = slots
  const { ClearSelectionButton } = slotProps

  return (
    <HStack justify='space-between' align='center' gap='xs'>
      <HStack justify='space-between' align='center' gap='md'>
        {showCount && totalCount && (
          <Span>
            {totalCount}
            {' selected '}
            {pluralize('item', totalCount)}
          </Span>
        )}
        {ClearSelectionButton && (
          <Button
            variant='outlined'
            inset
            onClick={ClearSelectionButton.onClick}
            aria-label='Clear Bulk Selections'
          >
            Clear
          </Button>
        )}
      </HStack>
      <Actions />
    </HStack>
  )
}
