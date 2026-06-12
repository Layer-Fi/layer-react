import { Fragment, type ReactNode, useEffect } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import type { BalanceSheet } from '@internal-types/balanceSheet'
import type { LineItem } from '@internal-types/lineItem'
import { Alignment } from '@schemas/reports/unifiedReport'
import { useEffectOnMount } from '@hooks/utils/react/useEffectOnMount'
import { useTableExpandRow } from '@hooks/utils/tables/useTableExpandRow'
import { HStack } from '@ui/Stack/Stack'
import { Cell, Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
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
          className={classNames(
            expandable && 'Layer__ReportTable__ExpandableRow',
            depth === 0 && rowIndex > 0 && 'Layer__ReportTable__DividerRow',
          )}
          onAction={expandable ? () => setIsOpen(rowKey) : undefined}
        >
          <Cell nonAria>
            {expandable
              ? (
                <HStack align='center' gap='xs'>
                  <ExpandButton isExpanded={showChildren} />
                  <Span weight='bold'>{lineItem.display_name}</Span>
                </HStack>
              )
              : lineItem.display_name}
          </Cell>
          <Cell nonAria alignment={Alignment.Right}>
            {(!expandable || (expandable && !expanded)) && (
              <MoneySpan
                amount={lineItem.value ?? 0}
                weight={expandable ? 'bold' : 'normal'}
              />
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
          <Row nonAria depth={depth + 1} className='Layer__ReportTable__SummationRow'>
            <Cell nonAria>
              <Span weight='bold'>
                {t('reports:label.total_display_name', 'Total of {{displayName}}', { displayName: lineItem.display_name })}
              </Span>
            </Cell>
            <Cell nonAria alignment={Alignment.Right}>
              <MoneySpan amount={lineItem.value ?? 0} weight='bold' />
            </Cell>
          </Row>
        )}
      </Fragment>
    )
  }

  return (
    <div className='Layer__UI__Table-ScrollContainer'>
      <Table nonAria className='Layer__UI__Table__Report Layer__UI__Table__Report--bottom-spacing'>
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
