import { type ReactElement, useCallback, useMemo, useState } from 'react'
import { type Selection } from 'react-aria-components/GridList'
import { useTranslation } from 'react-i18next'

import { Tree } from '@ui/Tree/Tree'
import { TreeNavigationGroup } from '@components/NestedNavigation/TreeNavigation/TreeNavigationGroup'
import { TreeNavigationLeaf } from '@components/NestedNavigation/TreeNavigation/TreeNavigationLeaf'
import type { Key, NestedNavigationLeafConfig, RecursiveNestedNavigationGroupConfig } from '@components/NestedNavigation/types'
import { getSelectedItemSet, handleSelectItem, indexRecursiveNavigation } from '@components/NestedNavigation/utils'

import './treeNavigation.scss'

type TreeNavigationProps<TGroup extends object, TLeaf extends object> = {
  items: Iterable<TGroup | TLeaf>
  selectedItem?: Key | null

  isGroup: (item: TGroup | TLeaf) => item is TGroup
  groupConfig: RecursiveNestedNavigationGroupConfig<TGroup, TLeaf>
  leafConfig: NestedNavigationLeafConfig<TLeaf>

  ariaLabel: string
}

export function TreeNavigation<TGroup extends object, TLeaf extends object>({
  items,
  selectedItem,
  isGroup,
  groupConfig,
  leafConfig,
  ariaLabel,
}: TreeNavigationProps<TGroup, TLeaf>) {
  const { t } = useTranslation()
  const chevronLabel = useCallback(
    (groupName: string) => t('common:action.toggle_section', 'Toggle {{name}}', { name: groupName }),
    [t],
  )
  const itemArray = useMemo(() => Array.from(items), [items])

  const { groupIds, leafMap } = useMemo(
    () => indexRecursiveNavigation({
      items: itemArray,
      isGroup,
      groupConfig,
      leafConfig,
    }),
    [itemArray, isGroup, groupConfig, leafConfig],
  )

  const [expandedKeys, setExpandedKeys] = useState<Set<Key>>(new Set(groupIds))

  const toggleGroup = useCallback((groupId: Key) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      }
      else {
        next.add(groupId)
      }
      return next
    })
  }, [])

  const handleSelectionChange = useCallback((selection: Selection) => {
    handleSelectItem({
      selection,
      leafMap,
      onSelectLeaf: leafConfig.onSelectLeaf,
    })
  }, [leafMap, leafConfig])

  const renderItem = (item: TGroup | TLeaf): ReactElement => {
    if (isGroup(item)) {
      return (
        <TreeNavigationGroup
          id={groupConfig.getId(item)}
          group={item}
          groupConfig={groupConfig}
          onToggle={toggleGroup}
          renderItem={renderItem}
          chevronLabel={chevronLabel}
        />
      )
    }
    return (
      <TreeNavigationLeaf
        id={leafConfig.getId(item)}
        leaf={item}
        leafConfig={leafConfig}
      />
    )
  }

  return (
    <Tree
      aria-label={ariaLabel}
      selectionMode='single'
      selectedKeys={getSelectedItemSet(selectedItem)}
      onSelectionChange={handleSelectionChange}
      disabledKeys={groupIds}
      disabledBehavior='selection'
      expandedKeys={expandedKeys}
      onExpandedChange={setExpandedKeys}
      items={itemArray}
      className='Layer__TreeNavigation'
    >
      {renderItem}
    </Tree>
  )
}
