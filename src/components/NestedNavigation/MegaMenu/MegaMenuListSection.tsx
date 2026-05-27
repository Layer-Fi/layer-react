import { ListBoxSection } from 'react-aria-components/ListBox'

import { Header } from '@ui/Typography/Text'
import { MegaMenuListItem } from '@components/NestedNavigation/MegaMenu/MegaMenuListItem'
import type { FlatNestedNavigationGroupConfig, Key, NestedNavigationLeafConfig } from '@components/NestedNavigation/types'

import './megaMenuListSection.scss'

export type MegaMenuListSectionProps<TGroup extends object, TLeaf extends object> = {
  id: Key
  group: TGroup
  groupConfig: FlatNestedNavigationGroupConfig<TGroup, TLeaf>
  leafConfig: NestedNavigationLeafConfig<TLeaf>
}

export function MegaMenuListSection<TGroup extends object, TLeaf extends object>({
  id,
  group,
  groupConfig,
  leafConfig,
}: MegaMenuListSectionProps<TGroup, TLeaf>) {
  return (
    <ListBoxSection id={id} className='Layer__MegaMenuListSection'>
      <Header pis='xs' pbe='xs'>{groupConfig.renderLabel(group)}</Header>
      {Array.from(groupConfig.getChildren(group)).map((leaf) => {
        const leafId = leafConfig.getId(leaf)
        return (
          <MegaMenuListItem
            key={leafId}
            id={leafId}
            leaf={leaf}
            leafConfig={leafConfig}
          />
        )
      })}
    </ListBoxSection>
  )
}
