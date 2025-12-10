import { useBulkSelectionActions, useCountSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import X from '@icons/X'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './bulkActionsModule.scss'

export interface BulkActionsModuleProps {
  showSelectedLabel?: boolean
  fullWidth?: boolean
  slots: {
    BulkActions: React.FC
  }
}

export const BulkActionsModule = ({ showSelectedLabel = true, fullWidth = false, slots }: BulkActionsModuleProps) => {
  const { count } = useCountSelectedIds()
  const { clearSelection } = useBulkSelectionActions()
  return (
    <HStack slot='toggle' justify='space-between' align='center' gap='xs' fluid={fullWidth ? true : undefined}>
      <HStack justify='space-between' align='center' pis='sm' pie='3xs' gap='3xs' className='Layer__BulkActionsModule__SelectedItemsContainer'>
        <Span noWrap>
          {showSelectedLabel ? `${count} selected` : count}
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
