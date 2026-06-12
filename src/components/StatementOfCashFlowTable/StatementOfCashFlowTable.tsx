import { Fragment, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { type LineItem } from '@internal-types/lineItem'
import { type StatementOfCashFlow } from '@internal-types/statementOfCashFlow'
import { Alignment } from '@schemas/reports/unifiedReport'
import { useTableExpandRow } from '@hooks/utils/tables/useTableExpandRow'
import { HStack } from '@ui/Stack/Stack'
import { Cell, Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { ExpandButton } from '@components/ExpandButton/ExpandButton'

type StatementOfCashFlowRowProps = {
  name: string
  displayName: string
  lineItem: string | undefined
  summarize: boolean
  type: string
}

export interface StatementOfCashFlowTableStringOverrides {
  typeColumnHeader?: string
  totalColumnHeader?: string
}

export const StatementOfCashFlowTable = ({
  data,
  config,
  stringOverrides,
}: {
  data: StatementOfCashFlow
  config: StatementOfCashFlowRowProps[]
  stringOverrides?: StatementOfCashFlowTableStringOverrides
}) => {
  const { t } = useTranslation()
  const { isOpen, setIsOpen } = useTableExpandRow()

  const renderLineItem = (
    lineItem: LineItem,
    depth: number = 0,
    rowKey: string,
    rowIndex: number,
  ): ReactNode => {
    const expandable = !!lineItem.line_items && lineItem.line_items.length > 0
    const expanded = expandable ? isOpen(rowKey) : true

    return (
      <Fragment key={rowKey + '-' + rowIndex}>
        <Row
          nonAria
          depth={depth}
          variant={expandable ? 'expandable' : 'default'}
          onAction={expandable ? () => setIsOpen(rowKey) : undefined}
        >
          <Cell nonAria indent={depth} primary={expandable}>
            {expandable
              ? (
                <HStack align='center' gap='xs'>
                  <ExpandButton isExpanded={expanded} />
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
        {expanded
          && lineItem.line_items
          && lineItem.line_items.map((subItem, subIdx) =>
            renderLineItem(
              subItem,
              depth + 1,
              rowKey + ':' + subItem.name,
              subIdx,
            ),
          )}
        {expanded && expandable && (
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
              {stringOverrides?.typeColumnHeader || t('common:label.type', 'Type')}
            </Column>
            <Column nonAria alignment={Alignment.Right}>
              {stringOverrides?.totalColumnHeader || t('common:label.total', 'Total')}
            </Column>
          </Row>
        </TableHeader>
        <TableBody nonAria>
          {config.map((row, idx) => {
            if (row.type === 'line_item') {
              return (
                <Fragment key={row.lineItem}>
                  {data[row.lineItem as keyof StatementOfCashFlow]
                    && renderLineItem(
                      data[row.lineItem as keyof StatementOfCashFlow] as LineItem,
                      0,
                      row.lineItem ? row.lineItem : '',
                      idx,
                    )}
                </Fragment>
              )
            }
            else {
              return (
                <Row
                  key={row.name + '-' + idx}
                  nonAria
                  variant='default'
                >
                  <Cell nonAria primary>{row.displayName}</Cell>
                  <Cell nonAria primary alignment={Alignment.Right}>
                    <MoneySpan amount={(data[row.lineItem as keyof StatementOfCashFlow] as number) ?? 0} />
                  </Cell>
                </Row>
              )
            }
          })}
        </TableBody>
      </Table>
    </div>
  )
}
