import X from '../../icons/X'
import { useBulkSelectionActions, useCountSelectedIds } from '../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { Button } from '../ui/Button/Button'
import { HStack } from '../ui/Stack/Stack'
import { Span } from '../ui/Typography/Text'
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
      <HStack justify='space-between' align='center' pis='xs' pie='3xs' gap='3xs' className='Layer__BulkActionsModule__SelectedItemsContainer'>
        <Span noWrap>
          {count}
          {' selected '}
        </Span>
        <Button
          variant='ghost'
          icon
          inset
          onClick={clearSelection}
          aria-label='Clear selected items'
        >
          <X />
        </Button>
      </HStack>
      <slots.BulkActions />
    </HStack>
  )
}
