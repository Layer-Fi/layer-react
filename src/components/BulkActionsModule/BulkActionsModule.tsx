import { Button } from '../ui/Button/Button'
import { HStack } from '../ui/Stack/Stack'
import { Span } from '../ui/Typography/Text'
import pluralize from 'pluralize'

export interface BulkActionsModuleProps {
  count: number
  clearSelection: () => void
  slots: {
    BulkActions: React.FC
  }
}

export const BulkActionsModule = ({ count, clearSelection, slots }: BulkActionsModuleProps) => {
  return (
    <HStack slot='toggle' justify='space-between' align='center' gap='xs'>
      <HStack justify='space-between' align='center' gap='sm' pi='sm'>
        <div style={{ minWidth: '7.5rem' }}>
          <Span>
            {count}
            {' selected '}
            {pluralize('item', count)}
          </Span>
        </div>
        <div style={{ width: '1px', height: '2rem', backgroundColor: 'var(--color-base-300)' }} />
        <HStack align='center'>
          <Button
            variant='text'
            onClick={clearSelection}
            aria-label='Clear Bulk Selections'
          >
            Clear
          </Button>
        </HStack>
      </HStack>
      <slots.BulkActions />
    </HStack>
  )
}
