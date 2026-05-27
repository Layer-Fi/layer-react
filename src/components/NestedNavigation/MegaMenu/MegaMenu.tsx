import { type ReactNode, useMemo } from 'react'
import { type Placement } from 'react-aria-components/Popover'

import { Overlay } from '@ui/Overlay/Overlay'
import { MegaMenuList } from '@components/NestedNavigation/MegaMenu/MegaMenuList'
import type { FlatNestedNavigationGroupConfig, Key, NestedNavigationLeafConfig } from '@components/NestedNavigation/types'

const COLUMN_WIDTH = 200
const COLUMN_GAP = 24
const PADDING = 16

const getWidth = (numGroups: number) => {
  const numColumns = Math.min(numGroups, 3)
  return (numColumns * COLUMN_WIDTH) + ((numColumns - 1) * COLUMN_GAP) + (PADDING * 2)
}

type MegaMenuProps<TGroup extends object, TLeaf extends object> = {
  items: Iterable<TGroup>
  selectedItem?: Key | null
  placement?: Placement
  groupConfig: FlatNestedNavigationGroupConfig<TGroup, TLeaf>
  leafConfig: NestedNavigationLeafConfig<TLeaf>
  slots: {
    Trigger: ReactNode
  }
}

export function MegaMenu<TGroup extends object, TLeaf extends object>({
  items,
  selectedItem,
  placement,
  groupConfig,
  leafConfig,
  slots,
}: MegaMenuProps<TGroup, TLeaf>) {
  const itemArray = useMemo(() => Array.from(items), [items])
  const width = getWidth(itemArray.length)

  const slotProps = useMemo(() => ({
    Popover: { placement, flexInline: true },
    Dialog: { width },
  }), [placement, width])

  return (
    <Overlay slots={{ Trigger: slots.Trigger }} slotProps={slotProps}>
      {({ close }) => (
        <MegaMenuList
          items={itemArray}
          selectedItem={selectedItem}
          groupConfig={groupConfig}
          leafConfig={leafConfig}
          onSelectItem={close}
        />
      )}
    </Overlay>
  )
}
