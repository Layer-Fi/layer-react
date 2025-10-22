import { useBulkSelectionActions, useCountSelectedIds } from '../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { Button } from '../ui/Button/Button'
import { HStack } from '../ui/Stack/Stack'
import { Span } from '../ui/Typography/Text'
import pluralize from 'pluralize'
import './bulkActionsModule.scss'

export interface BulkActionsModuleProps {
  slots: {
    BulkActions: React.FC
  }
}

export const BulkActionsModule = ({ slots }: BulkActionsModuleProps) => {
  const { count } = useCountSelectedIds()
  const { clearSelection } = useBulkSelectionActions()
  return (
    <HStack slot='toggle' justify='space-between' align='center' gap='xs'>
      <HStack justify='space-between' align='center' gap='sm' pi='sm' className='Layer__BulkActionsModule__SelectedItemsContainer'>
        <div className='Layer__BulkActionsModule__SelectedItems'>
          <Span>
            {count}
            {' selected '}
            {pluralize('item', count)}
          </Span>
        </div>
        <div className='Layer__BulkActionsModule__Divider' />
        <HStack align='center'>
          <Button
            variant='text'
            onClick={clearSelection}
            aria-label='Clear selected items'
          >
            Clear
          </Button>
        </HStack>
      </HStack>
      <slots.BulkActions />
    </HStack>
  )
}
