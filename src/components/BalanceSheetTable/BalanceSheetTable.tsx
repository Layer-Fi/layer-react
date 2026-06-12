import { Fragment, type ReactNode, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import type { BalanceSheet } from '@internal-types/balanceSheet'
import type { LineItem } from '@internal-types/lineItem'
import { Alignment } from '@schemas/reports/unifiedReport'
import { useEffectOnMount } from '@hooks/utils/react/useEffectOnMount'
import { useTableExpandRow } from '@hooks/utils/tables/useTableExpandRow'
import { HStack } from '@ui/Stack/Stack'
import { Cell, Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { ExpandButton } from '@components/ExpandButton/ExpandButton'

export interface BalanceSheetTableStringOverrides {
  typeColumnHeader?: string
  totalColumnHeader?: string
}

type BalanceSheetRowProps = {
  name: string
  displayName: string
  lineItem: string
}

export const BalanceSheetTable = ({
  data,
  config,
  stringOverrides,
}: {
  data: BalanceSheet
  config: BalanceSheetRowProps[]
  stringOverrides?: BalanceSheetTableStringOverrides
}) => {
  const { t } = useTranslation()
  const { isOpen, setIsOpen, expandedAllRows } = useTableExpandRow()
  const allRowKeys: string[] = []

  useEffect(() => {
    if (expandedAllRows) {
      setIsOpen(allRowKeys, true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedAllRows])

  useEffectOnMount(() => {
    setIsOpen(['assets'])
  })

  const renderLineItem = (
    lineItem: LineItem,
    depth: number = 0,
    rowKey: string,
    rowIndex: number,
  ): ReactNode => {
    const expandable = !!lineItem.line_items && lineItem.line_items.length > 0

    const expanded = expandable ? isOpen(rowKey) : true

    const showChildren = expanded || expandedAllRows

    if (expandable) {
      allRowKeys.push(rowKey)
    }

    return (
      <Fragment key={rowKey + '-' + rowIndex}>
        <Row
          nonAria
          depth={depth}
          variant={expandable ? 'expandable' : 'default'}
          withDivider={depth === 0 && rowIndex > 0}
          onAction={expandable ? () => setIsOpen(rowKey) : undefined}
        >
          <Cell nonAria indent={depth} primary={expandable}>
            {expandable
              ? (
                <HStack align='center' gap='xs'>
                  <ExpandButton isExpanded={showChildren} />
                  {lineItem.display_name}
                </HStack>
              )
              : lineItem.display_name}
          </Cell>
          <Cell nonAria primary={expandable} alignment={Alignment.Right}>
            {(!expandable || (expandable && !expanded)) && (
              <MoneySpan amount={lineItem.value ?? 0} />
            )}
          </Cell>
        </Row>
        {showChildren
          && lineItem.line_items
          && lineItem.line_items.map((subItem, subIdx) =>
            renderLineItem(
              subItem,
              depth + 1,
              rowKey + ':' + subItem.name,
              subIdx,
            ),
          )}
        {showChildren && expandable && (
          <Row nonAria depth={depth + 1} variant='summation'>
            <Cell nonAria indent={depth + 1} primary>
              {t('reports:label.total_display_name', 'Total of {{displayName}}', { displayName: lineItem.display_name })}
            </Cell>
            <Cell nonAria primary alignment={Alignment.Right}>
              <MoneySpan amount={lineItem.value ?? 0} />
            </Cell>
          </Row>
        )}
      </Fragment>
    )
  }

  return (
    <div className='Layer__UI__Table-ScrollContainer'>
      <Table nonAria bottomSpacing className='Layer__UI__Table__Report'>
        <TableHeader nonAria>
          <Row nonAria>
            <Column nonAria>
              {stringOverrides?.typeColumnHeader || 'Type'}
            </Column>
            <Column nonAria alignment={Alignment.Right}>
              {stringOverrides?.totalColumnHeader || 'Total'}
            </Column>
          </Row>
        </TableHeader>
        <TableBody nonAria>
          {config.map((row, idx) => (
            <Fragment key={row.lineItem}>
              {data[row.lineItem as keyof BalanceSheet]
                && renderLineItem(
                  data[row.lineItem as keyof BalanceSheet] as LineItem,
                  0,
                  row.lineItem,
                  idx,
                )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
