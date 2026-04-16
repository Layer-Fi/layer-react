import { useCallback, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { SortOrder, type SortParams } from '@internal-types/utility/pagination'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import SortArrows from '@icons/SortArrows'
import { Button } from '@ui/Button/Button'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { type ColorSelector, type DetailData, type FallbackFillSelector, type SeriesData, type ValueFormatter } from '@components/DetailedCharts/types'

export interface DetailedTableStringOverrides {
  categoryColumnHeader?: string
  typeColumnHeader?: string
  valueColumnHeader?: string
}

export const UNCATEGORIZED_TYPES = ['UNCATEGORIZED_INFLOWS', 'UNCATEGORIZED_OUTFLOWS']

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

export interface DetailedTableProps<T extends SeriesData> {
  data: DetailData<T>
  sortParams: SortParams<string>
  sortFunction: SortFunction<T>
  stylingProps: DetailedTableStylingProps<T>
  interactionProps: DetailedTableInteractionProps<T>
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

export type SeriesDataWithType = SeriesData & {
  type: string
}

export const DetailedTable = <T extends SeriesDataWithType>({
  data,
  stylingProps,
  sortParams: initialSortParams,
  sortFunction,
  interactionProps,
  stringOverrides,
}: DetailedTableProps<T>) => {
  const { t } = useTranslation()
  const { formatPercent } = useIntlFormatter()
  const [sortParams, setSortParams] = useState<SortParams<string>>(initialSortParams)

  const setAndToggleSortDirection = (field: 'category' | 'type' | 'value') => {
    setSortParams((prev) => {
      const oppositeSortOrder = prev.sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC

      if (prev.sortBy === field) {
        sortFunction(data, { sortBy: field, sortOrder: oppositeSortOrder })
        return { ...prev, sortOrder: oppositeSortOrder }
      }
      sortFunction(data, { sortBy: field, sortOrder: oppositeSortOrder })
      return { ...prev, sortBy: field }
    })
  }

  const positiveTotal = data.data
    .filter(x => x.value > 0)
    .reduce((sum, x) => sum + x.value, 0)

  const buildColClass = useCallback((column: string) => {
    if (sortParams.sortBy === column) {
      const sortOrderClass = sortParams.sortOrder === SortOrder.ASC ? 'asc' : 'desc'
      return `sort--${sortOrderClass}`
    }
    return ''
  }, [sortParams])

  const { isMobile } = useSizeClass()

  return (
    <div className='Layer__profit-and-loss-detailed-charts__table-wrapper'>
      <div className='details-container'>
        <div className='table'>
          <table>
            <thead>
              <tr>
                <th></th>
                <th
                  className={classNames('Layer__sortable-col', buildColClass('category'))}
                  onClick={() => setAndToggleSortDirection('category')}
                >
                  {stringOverrides?.categoryColumnHeader || t('common:label.category', 'Category')}
                  {' '}
                  <SortArrows className='Layer__sort-arrows' />
                </th>
                {!isMobile && (
                  <th
                    className={classNames('Layer__sortable-col', buildColClass('type'))}
                    onClick={() => setAndToggleSortDirection('type')}
                  >
                    {stringOverrides?.typeColumnHeader || t('common:label.type', 'Type')}
                    {' '}
                    <SortArrows className='Layer__sort-arrows' />
                  </th>
                )}
                <th
                  className={classNames('Layer__sortable-col', buildColClass('value'), 'value-col')}
                  onClick={() => setAndToggleSortDirection('value')}
                >
                  {stringOverrides?.valueColumnHeader || t('common:label.value', 'Value')}
                  {' '}
                  <SortArrows className='Layer__sort-arrows' />
                </th>
                <th className='percent-col'></th>
              </tr>
            </thead>
            <tbody>
              {data.data
                .map((item, idx) => {
                  const share = item.value > 0 ? item.value / positiveTotal : 0
                  const shareFractionDigits = Math.abs(share) < 0.1 && share !== 0 ? 1 : 0
                  const formattedShare = formatPercent(share, {
                    maximumFractionDigits: shareFractionDigits,
                  })
                  return (
                    <tr
                      key={`pl-side-table-item-${idx}`}
                      className={classNames(
                        'Layer__profit-and-loss-detailed-table__row',
                        interactionProps.hoveredItem && interactionProps.hoveredItem.name === item.name
                          ? 'active'
                          : '',
                      )}
                      onMouseEnter={() => interactionProps.setHoveredItem(item)}
                      onMouseLeave={() => interactionProps.setHoveredItem(undefined)}
                    >
                      <td className='color-col'>
                        <ValueIcon
                          item={item}
                          colorSelector={stylingProps.colorSelector}
                          fallbackFillSelector={stylingProps.fallbackFillSelector}
                        />
                      </td>
                      <td className='category-col'>{item.displayName}</td>
                      {!isMobile && (
                        <td className='type-col'>{item.type}</td>
                      )}
                      <td className='value-col'>
                        <Button
                          variant='text'
                          onPress={() => interactionProps.onValueClick?.(item)}
                          isDisabled={!interactionProps.onValueClick || UNCATEGORIZED_TYPES.includes(item.name)}
                        >
                          <MoneySpan size='sm' amount={item.value} />
                        </Button>
                      </td>
                      <td className='percent-col'>
                        <span className='share-text'>
                          {item.value < 0 ? '-' : formattedShare}
                        </span>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
