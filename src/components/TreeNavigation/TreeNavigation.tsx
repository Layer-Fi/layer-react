import { type ReactElement, type ReactNode, useCallback, useMemo, useState } from 'react'
import {
  Button as ReactAriaButton,
  Collection as ReactAriaCollection,
  type Selection,
} from 'react-aria-components'
import { useTranslation } from 'react-i18next'

import Check from '@icons/Check'
import ChevronRight from '@icons/ChevronRight'
import { HStack } from '@ui/Stack/Stack'
import { Tree, TreeItem, TreeItemContent } from '@ui/Tree/Tree'
import { indexTree, type Key } from '@components/TreeNavigation/utils'

import './treeNavigation.scss'

type TreeNavigationItemConfig<T> = {
  getId: (item: T) => Key
  getTextValue: (item: T) => string
  renderLabel: (item: T) => ReactNode
}

export type TreeNavigationGroupConfig<TGroup, TLeaf> = TreeNavigationItemConfig<TGroup> & {
  getChildren: (group: TGroup) => Iterable<TGroup | TLeaf>
}

export type TreeNavigationLeafConfig<TLeaf> = TreeNavigationItemConfig<TLeaf> & {
  onSelectLeaf: (leaf: TLeaf) => void
}

type TreeNavigationProps<TGroup extends object, TLeaf extends object> = {
  items: Iterable<TGroup | TLeaf>
  selectedItem?: Key | null

  isGroup: (item: TGroup | TLeaf) => item is TGroup
  groupConfig: TreeNavigationGroupConfig<TGroup, TLeaf>
  leafConfig: TreeNavigationLeafConfig<TLeaf>

  ariaLabel: string
}

type RenderTreeGroupArgs<TGroup extends object, TLeaf extends object> = {
  group: TGroup
  groupConfig: TreeNavigationGroupConfig<TGroup, TLeaf>
  onToggle: (groupId: Key) => void
  renderItem: (item: TGroup | TLeaf) => ReactElement
  chevronLabel: (groupName: string) => string
}

const renderTreeGroup = <TGroup extends object, TLeaf extends object>({
  group,
  groupConfig,
  onToggle,
  renderItem,
  chevronLabel,
}: RenderTreeGroupArgs<TGroup, TLeaf>): ReactElement => {
  const groupId = groupConfig.getId(group)
  const textValue = groupConfig.getTextValue(group)
  return (
    <TreeItem id={groupId} textValue={textValue} onAction={() => onToggle(groupId)}>
      <TreeItemContent>
        <HStack className='Layer__TreeNavigation__Row' align='center' justify='space-between'>
          {groupConfig.renderLabel(group)}
          <ReactAriaButton
            className='Layer__TreeNavigation__Chevron'
            slot='chevron'
            aria-label={chevronLabel(textValue)}
          >
            <ChevronRight width={16} height={16} />
          </ReactAriaButton>
        </HStack>
      </TreeItemContent>
      <ReactAriaCollection items={Array.from(groupConfig.getChildren(group))}>
        {renderItem}
      </ReactAriaCollection>
    </TreeItem>
  )
}

type RenderTreeLeafArgs<TLeaf extends object> = {
  leaf: TLeaf
  leafConfig: TreeNavigationLeafConfig<TLeaf>
}

const renderTreeLeaf = <TLeaf extends object>({ leaf, leafConfig }: RenderTreeLeafArgs<TLeaf>): ReactElement => (
  <TreeItem id={leafConfig.getId(leaf)} textValue={leafConfig.getTextValue(leaf)}>
    <TreeItemContent>
      <HStack align='center' justify='space-between'>
        {leafConfig.renderLabel(leaf)}
        <Check className='Layer__TreeNavigation__Check' />
      </HStack>
    </TreeItemContent>
  </TreeItem>
)

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
    () => indexTree({
      items: itemArray,
      isGroup,
      getChildren: groupConfig.getChildren,
      getGroupId: groupConfig.getId,
      getLeafId: leafConfig.getId,
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
    if (selection === 'all') return

    const nextKey = selection.values().next().value
    if (nextKey == null) return

    const leaf = leafMap.get(nextKey)
    if (leaf) leafConfig.onSelectLeaf(leaf)
  }, [leafMap, leafConfig])

  const selectedItems = selectedItem != null ? [selectedItem] : []

  const renderItem = (item: TGroup | TLeaf): ReactElement => {
    if (isGroup(item)) {
      return renderTreeGroup({
        group: item,
        groupConfig,
        onToggle: toggleGroup,
        renderItem,
        chevronLabel,
      })
    }
    return renderTreeLeaf({ leaf: item, leafConfig })
  }

  return (
    <Tree
      aria-label={ariaLabel}
      selectionMode='single'
      selectedKeys={selectedItems}
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
