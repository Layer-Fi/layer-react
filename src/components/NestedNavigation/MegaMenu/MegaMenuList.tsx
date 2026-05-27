import { useCallback, useMemo } from 'react'
import { ListBox, type Selection } from 'react-aria-components/ListBox'

import { MegaMenuListSection } from '@components/NestedNavigation/MegaMenu/MegaMenuListSection'
import type { FlatNestedNavigationGroupConfig, Key, NestedNavigationLeafConfig } from '@components/NestedNavigation/types'
import { getSelectedItemSet, handleSelectItem, indexFlatNavigation } from '@components/NestedNavigation/utils'

import './megaMenuList.scss'

export type MegaMenuListProps<TGroup extends object, TLeaf extends object> = {
  items: Iterable<TGroup>
  selectedItem?: Key | null
  groupConfig: FlatNestedNavigationGroupConfig<TGroup, TLeaf>
  leafConfig: NestedNavigationLeafConfig<TLeaf>
  onSelectItem: () => void
}

export function MegaMenuList<TGroup extends object, TLeaf extends object>({
  items,
  selectedItem,
  groupConfig,
  leafConfig,
  onSelectItem,
}: MegaMenuListProps<TGroup, TLeaf>) {
  const itemArray = useMemo(() => Array.from(items), [items])

  const { leafMap } = useMemo(() => indexFlatNavigation({
    items: itemArray,
    groupConfig,
    leafConfig,
  }), [itemArray, groupConfig, leafConfig])

  const handleSelectionChange = useCallback((selection: Selection) => {
    handleSelectItem({
      selection,
      leafMap,
      onSelectLeaf: leafConfig.onSelectLeaf,
    })

    onSelectItem()
  }, [leafMap, leafConfig.onSelectLeaf, onSelectItem])

  return (
    <ListBox
      layout='grid'
      selectionMode='single'
      selectedKeys={getSelectedItemSet(selectedItem)}
      onSelectionChange={handleSelectionChange}
      items={itemArray}
      className='Layer__MegaMenuList'
    >
      {group => (
        <MegaMenuListSection
          id={groupConfig.getId(group)}
          group={group}
          groupConfig={groupConfig}
          leafConfig={leafConfig}
        />
      )}
    </ListBox>
  )
}
