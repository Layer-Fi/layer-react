import { type ReactElement } from 'react'

import { TreeItem, TreeItemContent } from '@ui/Tree/Tree'
import type { Key, NestedNavigationLeafConfig } from '@components/NestedNavigation/types'

type TreeNavigationLeafProps<TLeaf extends object> = {
  id: Key
  leaf: TLeaf
  leafConfig: NestedNavigationLeafConfig<TLeaf>
}

export function TreeNavigationLeaf<TLeaf extends object>({
  id,
  leaf,
  leafConfig,
}: TreeNavigationLeafProps<TLeaf>): ReactElement {
  return (
    <TreeItem id={id} textValue={leafConfig.getTextValue(leaf)}>
      <TreeItemContent>
        {leafConfig.renderLabel(leaf)}
      </TreeItemContent>
    </TreeItem>
  )
}
