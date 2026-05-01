import { type Row } from '@tanstack/react-table'

import { HStack } from '@ui/Stack/Stack'
import { type CellRenderer } from '@components/DataTable/columnUtils'
import { ExpandButton } from '@components/ExpandButton/ExpandButton'

import { type ExpandableDataTableIndentSize } from './ExpandableDataTable'

const INDENT_SIZE_XS = 10
const INDENT_SIZE_SM = 20
const INDENT_SIZE_MD = 40

const getRowIndentStyle = ({ depth, indentSizePx }: { depth: number, indentSizePx: number }) => ({
  paddingInlineStart: depth * indentSizePx,
})

export type ExpandAwareRenderCellParams<TData> = {
  indentSize: ExpandableDataTableIndentSize
  renderFirstCellPrefix: CellRenderer<TData> | null | undefined
  cellRenderer: CellRenderer<TData>
}
export function expandAwareRenderCell<TData>({ indentSize, renderFirstCellPrefix, cellRenderer }: ExpandAwareRenderCellParams<TData>): CellRenderer<TData> {
  return function Render(row: Row<TData>) {
    const canExpand = row.getCanExpand()
    const indentSizePx = indentSize === 'xs' ? INDENT_SIZE_XS : indentSize === 'md' ? INDENT_SIZE_MD : INDENT_SIZE_SM
    const rowIndentStyle = getRowIndentStyle({ depth: row.depth, indentSizePx })
    const prefix = renderFirstCellPrefix?.(row)

    const hasPrefix = prefix !== null && prefix !== undefined && prefix !== false
    return (
      <div className='Layer__ExpandableDataTable__FirstCell' style={rowIndentStyle}>
        {!hasPrefix && (
          <HStack
            className='Layer__ExpandableDataTable__ChevronSlot'
            align='center'
            justify='center'
          >
            {canExpand && <ExpandButton isExpanded={row.getIsExpanded()} />}
          </HStack>
        )}
        {hasPrefix && (
          <HStack className='Layer__ExpandableDataTable__PrefixSlot'>
            {prefix}
          </HStack>
        )}
        <div className='Layer__ExpandableDataTable__FirstCell__Content'>
          {cellRenderer(row)}
        </div>
      </div>
    )
  }
}
