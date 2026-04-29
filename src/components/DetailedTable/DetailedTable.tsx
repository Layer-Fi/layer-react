import { useCallback } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { SortOrder, type SortParams } from '@internal-types/utility/pagination'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import SortArrows from '@icons/SortArrows'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { type ColorSelector, type DetailData, type FallbackFillSelector, type SeriesData } from '@components/DetailedCharts/types'
import { NO_OP_INTERACTION_PROPS } from '@components/DetailedCharts/utils'

import './detailedTable.scss'

import { type DetailedTableRow, useDetailedTableRows } from './useDetailedTableRows'
import { ValueIcon } from './ValueIcon'

export interface DetailedTableStringOverrides {
  categoryColumnHeader?: string
  typeColumnHeader?: string
  valueColumnHeader?: string
}

type SetAndToggleSortDirectionParams = {
  field: 'category' | 'type' | 'value'
  sortOrderOverride?: SortOrder
  defaultSortOrder?: SortOrder
}
interface DetailedTableBaseProps<T extends SeriesData> {
  sortParams: SortParams<string>
  sortFunction: (sortParams: SortParams<string>, defaultDirection?: SortOrder) => void
  stylingProps: {
    colorSelector: ColorSelector<T>
    fallbackFillSelector?: FallbackFillSelector<T>
  }
  interactionProps: {
    hoveredItem: T | undefined
    setHoveredItem: (item: T | undefined) => void
    onValueClick?: (item: T) => void
  }
  stringOverrides?: DetailedTableStringOverrides
  showTypeColumn?: boolean
}

export interface DetailedTableProps<T extends SeriesData> extends DetailedTableBaseProps<T> {
  rows: DetailedTableRow<T>[]
}

export interface DetailedTableWithDataProps<T extends SeriesData> extends DetailedTableBaseProps<T> {
  data: DetailData<T>
}

export const DetailedTable = <T extends SeriesData>({
  stylingProps,
  sortParams,
  sortFunction,
  interactionProps,
  rows,
  stringOverrides,
  showTypeColumn = true,
}: DetailedTableProps<T>) => {
  const { t } = useTranslation()

  const setAndToggleSortDirection = (params: SetAndToggleSortDirectionParams) => {
    const { field, sortOrderOverride, defaultSortOrder } = params
    sortFunction({ sortBy: field, sortOrder: sortOrderOverride }, defaultSortOrder)
  }

  const buildHeaderVariant = useCallback((column: string) => {
    return sortParams.sortBy === column ? undefined : 'subtle'
  }, [sortParams.sortBy])

  const { isMobile, isDesktop } = useSizeClass()
  const hasType = showTypeColumn && rows.length > 0 && rows.map(r => r.item.type).every(type => type !== undefined)
  const isSortable = interactionProps !== NO_OP_INTERACTION_PROPS

  return (
    <VStack className='Layer__DetailedTable'>
      <VStack className='Layer__DetailedTable__container' pi='md' pbs='2xs' pbe={isDesktop ? 'md' : undefined}>
        <VStack className={classNames('Layer__DetailedTable__table', isSortable && 'Layer__DetailedTable__table--sortable')}>
          <table>
            <thead>
              <tr>
                <th></th>
                <th
                  className={classNames(
                    'Layer__DetailedTable__SortableColumn',
                    sortParams.sortBy === 'category' && sortParams.sortOrder && `Layer__DetailedTable__SortableColumn--sort${sortParams.sortOrder.toLowerCase()}`,
                  )}
                  onClick={() => setAndToggleSortDirection({ field: 'category' })}
                >
                  <HStack align='center' gap='3xs'>
                    <Span variant={buildHeaderVariant('category')} size='sm'>
                      {stringOverrides?.categoryColumnHeader || t('common:label.category', 'Category')}
                    </Span>
                    {isSortable && <SortArrows className='Layer__DetailedTable__sortArrows' />}
                  </HStack>
                </th>
                {!isMobile && hasType && (
                  <th
                    className={classNames(
                      'Layer__DetailedTable__SortableColumn',
                      sortParams.sortBy === 'type' && sortParams.sortOrder && `Layer__DetailedTable__SortableColumn--sort${sortParams.sortOrder.toLowerCase()}`,
                    )}
                    onClick={() => setAndToggleSortDirection({ field: 'type' })}
                  >
                    <HStack align='center' gap='3xs'>
                      <Span variant={buildHeaderVariant('type')} size='sm'>
                        {stringOverrides?.typeColumnHeader || t('common:label.type', 'Type')}
                      </Span>
                      {isSortable && <SortArrows className='Layer__DetailedTable__sortArrows' />}
                    </HStack>
                  </th>
                )}
                <th
                  className={classNames(
                    'Layer__DetailedTable__SortableColumn',
                    'Layer__DetailedTable__SortableColumn--value',
                    sortParams.sortBy === 'value' && sortParams.sortOrder && `Layer__DetailedTable__SortableColumn--sort${sortParams.sortOrder.toLowerCase()}`,
                  )}
                  onClick={() => setAndToggleSortDirection({ field: 'value', defaultSortOrder: SortOrder.DESC })}
                >
                  <HStack align='center' gap='3xs' justify='end'>
                    <Span variant={buildHeaderVariant('value')} size='sm'>
                      {stringOverrides?.valueColumnHeader || t('common:label.value', 'Value')}
                    </Span>
                    {isSortable && <SortArrows className='Layer__DetailedTable__sortArrows' />}
                  </HStack>
                </th>
                <th className='Layer__DetailedTable__Column--percent'></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isRowActive = interactionProps.hoveredItem?.name === row.item.name
                return (
                  <tr
                    key={row.key}
                    className={classNames(
                      'Layer__DetailedTable__row',
                      isRowActive ? 'active' : '',
                    )}
                    onMouseEnter={() => interactionProps.setHoveredItem(row.item)}
                    onMouseLeave={() => interactionProps.setHoveredItem(undefined)}
                  >
                    <td className='Layer__DetailedTable__Column Layer__DetailedTable__Column--color'>
                      <ValueIcon<T> item={row.item} {...stylingProps} />
                    </td>
                    <td className='Layer__DetailedTable__Column Layer__DetailedTable__Column--category'>
                      <Span size='sm'>{row.item.displayName}</Span>
                    </td>
                    {!isMobile && hasType && (
                      <td className='Layer__DetailedTable__Column Layer__DetailedTable__Column--type'>
                        <Span variant={isRowActive ? undefined : 'subtle'} size='sm'>{row.item.type}</Span>
                      </td>
                    )}
                    <td className='Layer__DetailedTable__Column Layer__DetailedTable__Column--value'>
                      <Button
                        variant='text'
                        onPress={() => interactionProps.onValueClick?.(row.item)}
                        isDisabled={!interactionProps.onValueClick || row.isValueDisabled}
                      >
                        <MoneySpan size='sm' align='right' amount={row.item.value} />
                      </Button>
                    </td>
                    <td className='Layer__DetailedTable__Column Layer__DetailedTable__Column--percent'>
                      <Span className='share-text' variant={isRowActive ? undefined : 'subtle'} size='sm'>
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

export const DetailedTableWithData = <T extends SeriesData>({
  data,
  ...props
}: DetailedTableWithDataProps<T>) => {
  const rows = useDetailedTableRows({ data })
  return <DetailedTable<T> rows={rows} {...props} />
}
