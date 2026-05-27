import { type Selection } from 'react-aria-components'

import type {
  FlatNestedNavigationGroupConfig,
  Key,
  NestedNavigationLeafConfig,
  RecursiveNestedNavigationGroupConfig,
} from '@components/NestedNavigation/types'

type NavigationIndex<TLeaf> = {
  groupIds: Key[]
  leafMap: Map<Key, TLeaf>
}

type IndexRecursiveNavigationOptions<TGroup extends object, TLeaf extends object> = {
  items: Iterable<TGroup | TLeaf>
  isGroup: (item: TGroup | TLeaf) => item is TGroup
  groupConfig: RecursiveNestedNavigationGroupConfig<TGroup, TLeaf>
  leafConfig: NestedNavigationLeafConfig<TLeaf>
}

export const indexRecursiveNavigation = <TGroup extends object, TLeaf extends object>({
  items,
  isGroup,
  groupConfig,
  leafConfig,
}: IndexRecursiveNavigationOptions<TGroup, TLeaf>): NavigationIndex<TLeaf> => {
  const groupIds: Key[] = []
  const leafMap = new Map<Key, TLeaf>()

  const visit = (nodes: Iterable<TGroup | TLeaf>): void => {
    for (const node of nodes) {
      if (isGroup(node)) {
        groupIds.push(groupConfig.getId(node))
        visit(groupConfig.getChildren(node))
      }
      else {
        leafMap.set(leafConfig.getId(node), node)
      }
    }
  }

  visit(items)
  return { groupIds, leafMap }
}

type IndexFlatNavigationOptions<TGroup extends object, TLeaf extends object> = {
  items: Iterable<TGroup>
  groupConfig: FlatNestedNavigationGroupConfig<TGroup, TLeaf>
  leafConfig: NestedNavigationLeafConfig<TLeaf>
}

export const indexFlatNavigation = <TGroup extends object, TLeaf extends object>({
  items,
  groupConfig,
  leafConfig,
}: IndexFlatNavigationOptions<TGroup, TLeaf>): NavigationIndex<TLeaf> => {
  const groupIds: Key[] = []
  const leafMap = new Map<Key, TLeaf>()

  for (const group of items) {
    groupIds.push(groupConfig.getId(group))
    for (const leaf of groupConfig.getChildren(group)) {
      leafMap.set(leafConfig.getId(leaf), leaf)
    }
  }

  return { groupIds, leafMap }
}

export const getSelectedItemSet = (selectedItem: Key | null | undefined): Set<Key> =>
  selectedItem != null ? new Set([selectedItem]) : new Set()

type HandleSelectItemOptions<TLeaf> = {
  selection: Selection
  leafMap: Map<Key, TLeaf>
  onSelectLeaf: (leaf: TLeaf) => void
}

export const handleSelectItem = <TLeaf>({
  selection,
  leafMap,
  onSelectLeaf,
}: HandleSelectItemOptions<TLeaf>) => {
  if (selection === 'all') return

  const nextKey = selection.values().next().value
  if (nextKey == null) return

  const leaf = leafMap.get(nextKey)
  if (leaf) onSelectLeaf(leaf)
}
