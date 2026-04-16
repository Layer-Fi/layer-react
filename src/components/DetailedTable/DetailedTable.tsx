import { useCallback } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { SortOrder, type SortParams } from '@internal-types/utility/pagination'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import SortArrows from '@icons/SortArrows'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { type ColorSelector, type DetailData, type FallbackFillSelector, type SeriesData, type ValueFormatter } from '@components/DetailedCharts/types'

import './detailedTable.scss'

import { type DetailedTableRow, useDetailedTableRows } from './useDetailedTableRows'

export interface DetailedTableStringOverrides {
  categoryColumnHeader?: string
  typeColumnHeader?: string
  valueColumnHeader?: string
}

type DetailedTableStylingProps<T extends SeriesData> = {
  valueFormatter: ValueFormatter
  colorSelector: ColorSelector<T>
  fallbackFillSelector?: FallbackFillSelector<T>
}

type DetailedTableInteractionProps<T extends SeriesData> = {
  hoveredItem: T | undefined
  setHoveredItem: (item: T | undefined) => void
  onValueClick?: (item: T) => void
}

type SortFunction<T extends SeriesData> = (data: DetailData<T>, sortParams: SortParams<string>) => void

export type SeriesDataWithType = SeriesData & {
  type: string
}

export interface DetailedTableProps<T extends SeriesDataWithType> {
  data: DetailData<T>
  sortParams: SortParams<string>
  sortFunction: SortFunction<T>
  stylingProps: DetailedTableStylingProps<T>
  interactionProps: DetailedTableInteractionProps<T>
  rows?: DetailedTableRow<T>[]
  stringOverrides?: DetailedTableStringOverrides
}

const ValueIcon = <T extends SeriesData>({
  item,
  colorSelector,
  fallbackFillSelector,
}: {
  item: T
  colorSelector: ColorSelector<T>
  fallbackFillSelector?: FallbackFillSelector<T>
}) => {
  if (fallbackFillSelector?.(item)) {
    return (
      <svg
        viewBox='0 0 12 12'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        width='12'
        height='12'
      >
        <defs>
          <pattern
            id='layer-pie-dots-pattern-legend'
            x='0'
            y='0'
            width='3'
            height='3'
            patternUnits='userSpaceOnUse'
          >
            <rect width='1' height='1' opacity={0.76} className='Layer__charts__dots-pattern-legend__dot' />
          </pattern>
        </defs>
        <rect width='12' height='12' id='layer-pie-dots-pattern-bg' rx='2' className='Layer__charts__dots-pattern-legend__bg' />
        <rect
          x='1'
          y='1'
          width='10'
          height='10'
          fill='url(#layer-pie-dots-pattern-legend)'
        />
      </svg>
    )
  }

  return (
    <div
      className='share-icon'
      style={{
        background: colorSelector(item)?.color,
        opacity: colorSelector(item)?.opacity,
      }}
    />
  )
}

export const DetailedTable = <T extends SeriesDataWithType>({
  data,
  stylingProps,
  sortParams,
  sortFunction,
  interactionProps,
  rows,
  stringOverrides,
}: DetailedTableProps<T>) => {
  const { t } = useTranslation()
  const { formatPercent } = useIntlFormatter()
  const defaultRows = useDetailedTableRows({ data, formatPercent })
  const detailedTableRows = rows ?? defaultRows

  const setAndToggleSortDirection = (field: 'category' | 'type' | 'value') => {
    sortFunction(data, { sortBy: field })
  }

  const buildColClass = useCallback((column: string) => {
    if (sortParams.sortBy === column) {
      const sortOrderClass = sortParams.sortOrder === SortOrder.ASC ? 'asc' : 'desc'
      return `sort--${sortOrderClass}`
    }
    return ''
  }, [sortParams])

  const { isMobile } = useSizeClass()

  return (
    <VStack className='Layer__DetailedTable'>
      <VStack className='Layer__DetailedTable__container' pi='md' pbs='2xs' pbe='md'>
        <VStack className='Layer__DetailedTable__table'>
          <table>
            <thead>
              <tr>
                <th></th>
                <th
                  className={classNames('Layer__sortable-col', buildColClass('category'))}
                  onClick={() => setAndToggleSortDirection('category')}
                >
                  <HStack align='center' gap='3xs'>
                    {stringOverrides?.categoryColumnHeader || t('common:label.category', 'Category')}
                    <SortArrows className='Layer__DetailedTable__sortArrows' />
                  </HStack>
                </th>
                {!isMobile && (
                  <th
                    className={classNames('Layer__sortable-col', buildColClass('type'))}
                    onClick={() => setAndToggleSortDirection('type')}
                  >
                    <HStack align='center' gap='3xs'>
                      {stringOverrides?.typeColumnHeader || t('common:label.type', 'Type')}
                      <SortArrows className='Layer__DetailedTable__sortArrows' />
                    </HStack>
                  </th>
                )}
                <th
                  className={classNames('Layer__sortable-col', buildColClass('value'), 'value-col')}
                  onClick={() => setAndToggleSortDirection('value')}
                >
                  <HStack align='center' gap='3xs' justify='end'>
                    {stringOverrides?.valueColumnHeader || t('common:label.value', 'Value')}
                    <SortArrows className='Layer__DetailedTable__sortArrows' />
                  </HStack>
                </th>
                <th className='percent-col'></th>
              </tr>
            </thead>
            <tbody>
              {detailedTableRows
                .map((row) => {
                  return (
                    <tr
                      key={row.key}
                      className={classNames(
                        'Layer__DetailedTable__row',
                        interactionProps.hoveredItem && interactionProps.hoveredItem.name === row.item.name
                          ? 'active'
                          : '',
                      )}
                      onMouseEnter={() => interactionProps.setHoveredItem(row.item)}
                      onMouseLeave={() => interactionProps.setHoveredItem(undefined)}
                    >
                      <td className='color-col'>
                        <ValueIcon
                          item={row.item}
                          colorSelector={stylingProps.colorSelector}
                          fallbackFillSelector={stylingProps.fallbackFillSelector}
                        />
                      </td>
                      <td className='category-col'>{row.item.displayName}</td>
                      {!isMobile && (
                        <td className='type-col'>{row.item.type}</td>
                      )}
                      <td className='value-col'>
                        <Button
                          variant='text'
                          onPress={() => interactionProps.onValueClick?.(row.item)}
                          isDisabled={!interactionProps.onValueClick || row.isValueDisabled}
                        >
                          <MoneySpan size='sm' amount={row.item.value} />
                        </Button>
                      </td>
                      <td className='percent-col'>
                        <Span className='share-text'>
                          {row.item.value < 0 ? '-' : row.formattedShare}
                        </Span>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </VStack>
      </VStack>
    </VStack>
  )
}
