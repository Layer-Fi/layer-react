import { type ReactElement } from 'react'
import { ChevronRight } from 'lucide-react'
import { Button as ReactAriaButton } from 'react-aria-components/Button'
import { Collection as ReactAriaCollection } from 'react-aria-components/Collection'

import { HStack } from '@ui/Stack/Stack'
import { TreeItem, TreeItemContent } from '@ui/Tree/Tree'
import type { Key, RecursiveNestedNavigationGroupConfig } from '@components/NestedNavigation/types'

import './treeNavigationGroup.scss'

type TreeNavigationGroupProps<TGroup extends object, TLeaf extends object> = {
  id: Key
  group: TGroup
  groupConfig: RecursiveNestedNavigationGroupConfig<TGroup, TLeaf>
  onToggle: (groupId: Key) => void
  renderItem: (item: TGroup | TLeaf) => ReactElement
  chevronLabel: (groupName: string) => string
}

export function TreeNavigationGroup<TGroup extends object, TLeaf extends object>({
  id,
  group,
  groupConfig,
  onToggle,
  renderItem,
  chevronLabel,
}: TreeNavigationGroupProps<TGroup, TLeaf>): ReactElement {
  const textValue = groupConfig.getTextValue(group)

  return (
    <TreeItem id={id} textValue={textValue} onAction={() => onToggle(id)}>
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
