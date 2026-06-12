import { type PropsWithChildren } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type LineItem } from '@internal-types/lineItem'
import { Alignment } from '@schemas/reports/unifiedReport'
import { useTableExpandRow } from '@hooks/utils/tables/useTableExpandRow'
import { HStack } from '@ui/Stack/Stack'
import { Cell, Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { ExpandButton } from '@components/ExpandButton/ExpandButton'

import './reportsTable.scss'

const CSS_PREFIX = 'Layer__ReportsTable'

type ReportsTableProps = PropsWithChildren<{
  bottomSpacing?: boolean
}>

export const ReportsTable = ({ bottomSpacing = true, children }: ReportsTableProps) => (
  <div className='Layer__UI__Table-ScrollContainer'>
    <Table
      nonAria
      className={classNames(CSS_PREFIX, bottomSpacing && `${CSS_PREFIX}--bottom-spacing`)}
    >
      {children}
    </Table>
  </div>
)

type ReportsTableHeaderProps = {
  typeColumnHeader?: string
  totalColumnHeader?: string
}

export const ReportsTableHeader = ({
  typeColumnHeader,
  totalColumnHeader,
}: ReportsTableHeaderProps) => {
  const { t } = useTranslation()

  return (
    <TableHeader nonAria>
      <Row nonAria>
        <Column nonAria>
          {typeColumnHeader ?? t('common:label.type', 'Type')}
        </Column>
        <Column nonAria alignment={Alignment.Right}>
          {totalColumnHeader ?? t('common:label.total', 'Total')}
        </Column>
      </Row>
    </TableHeader>
  )
}

export const ReportsTableBody = ({ children }: PropsWithChildren) => (
  <TableBody nonAria>{children}</TableBody>
)

type ReportsTableRowProps = PropsWithChildren<{
  depth?: number
  expandable?: boolean
  summation?: boolean
  withDivider?: boolean
  onExpand?: () => void
}>

export const ReportsTableRow = ({
  depth,
  expandable = false,
  summation = false,
  withDivider = false,
  onExpand,
  children,
}: ReportsTableRowProps) => (
  <Row
    nonAria
    depth={depth}
    className={classNames(
      expandable && `${CSS_PREFIX}__ExpandableRow`,
      summation && `${CSS_PREFIX}__SummationRow`,
      withDivider && `${CSS_PREFIX}__DividerRow`,
    )}
    onAction={onExpand}
  >
    {children}
  </Row>
)

type ReportsTableNameCellProps = PropsWithChildren<{
  expandable?: boolean
  expanded?: boolean
  bold?: boolean
  className?: string
}>

export const ReportsTableNameCell = ({
  expandable = false,
  expanded = false,
  bold = false,
  className,
  children,
}: ReportsTableNameCellProps) => {
  const content = bold ? <Span weight='bold'>{children}</Span> : children

  return (
    <Cell nonAria className={className}>
      {expandable
        ? (
          <HStack align='center' gap='xs'>
            <ExpandButton isExpanded={expanded} />
            {content}
          </HStack>
        )
        : content}
    </Cell>
  )
}

type ReportsTableAmountCellProps = {
  amount?: number
  bold?: boolean
}

export const ReportsTableAmountCell = ({ amount, bold = false }: ReportsTableAmountCellProps) => (
  <Cell nonAria alignment={Alignment.Right}>
    {amount !== undefined && (
      <MoneySpan amount={amount} weight={bold ? 'bold' : 'normal'} />
    )}
  </Cell>
)

type ReportsTableTotalRowProps = {
  depth: number
  displayName: string
  amount: number
}

export const ReportsTableTotalRow = ({ depth, displayName, amount }: ReportsTableTotalRowProps) => {
  const { t } = useTranslation()

  return (
    <ReportsTableRow depth={depth} summation>
      <ReportsTableNameCell bold>
        {t('reports:label.total_display_name', 'Total of {{displayName}}', { displayName })}
      </ReportsTableNameCell>
      <ReportsTableAmountCell amount={amount} bold />
    </ReportsTableRow>
  )
}

type ReportsTableLineItemsProps = {
  lineItem: LineItem
  rowKey: string
  rowIndex: number
  depth?: number
  withDividers?: boolean
}

export const ReportsTableLineItems = ({
  lineItem,
  rowKey,
  rowIndex,
  depth = 0,
  withDividers = false,
}: ReportsTableLineItemsProps) => {
  const { isOpen, setIsOpen, expandedAllRows } = useTableExpandRow()

  const expandable = !!lineItem.line_items && lineItem.line_items.length > 0
  const expanded = (expandable ? isOpen(rowKey) : true) || expandedAllRows

  return (
    <>
      <ReportsTableRow
        depth={depth}
        expandable={expandable}
        withDivider={withDividers && depth === 0 && rowIndex > 0}
        onExpand={expandable ? () => setIsOpen(rowKey) : undefined}
      >
        <ReportsTableNameCell expandable={expandable} expanded={expanded} bold={expandable}>
          {lineItem.display_name}
        </ReportsTableNameCell>
        <ReportsTableAmountCell
          amount={!expandable || !expanded ? lineItem.value ?? 0 : undefined}
          bold={expandable}
        />
      </ReportsTableRow>
      {expanded
        && lineItem.line_items?.map((subItem, subIdx) => (
          <ReportsTableLineItems
            key={rowKey + ':' + subItem.name + '-' + subIdx}
            lineItem={subItem}
            rowKey={rowKey + ':' + subItem.name}
            rowIndex={subIdx}
            depth={depth + 1}
            withDividers={withDividers}
          />
        ))}
      {expanded && expandable && (
        <ReportsTableTotalRow
          depth={depth + 1}
          displayName={lineItem.display_name}
          amount={lineItem.value ?? 0}
        />
      )}
    </>
  )
}
