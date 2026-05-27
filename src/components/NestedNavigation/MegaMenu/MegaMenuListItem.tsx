import { ListBoxItem } from 'react-aria-components/ListBox'

import { Span } from '@ui/Typography/Text'
import type { Key, NestedNavigationLeafConfig } from '@components/NestedNavigation/types'

import './megaMenuListItem.scss'

type MegaMenuListItemProps<TLeaf extends object> = {
  id: Key
  leaf: TLeaf
  leafConfig: NestedNavigationLeafConfig<TLeaf>
}

export function MegaMenuListItem<TLeaf extends object>({
  id,
  leaf,
  leafConfig,
}: MegaMenuListItemProps<TLeaf>) {
  return (
    <ListBoxItem
      id={id}
      textValue={leafConfig.getTextValue(leaf)}
      className='Layer__MegaMenuListItem'
    >
      <Span slot='label'>{leafConfig.renderLabel(leaf)}</Span>
    </ListBoxItem>
  )
}
