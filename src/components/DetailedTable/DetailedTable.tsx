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

export type SeriesDataWithType = SeriesData & { type: string }
export interface DetailedTableProps<T extends SeriesDataWithType> {
  data: DetailData<T>
  sortParams: SortParams<string>
  sortFunction: (data: DetailData<T>, sortParams: SortParams<string>, defaultDirection?: SortOrder) => void
  stylingProps: {
    colorSelector: ColorSelector<T>
    fallbackFillSelector?: FallbackFillSelector<T>
  }
  interactionProps: {
    hoveredItem: T | undefined
    setHoveredItem: (item: T | undefined) => void
    onValueClick?: (item: T) => void
  }
  rows?: DetailedTableRow<T>[]
  stringOverrides?: DetailedTableStringOverrides
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
  const defaultRows = useDetailedTableRows({ data })
  const detailedTableRows = rows ?? defaultRows

  const setAndToggleSortDirection = (params: SetAndToggleSortDirectionParams) => {
    const { field, sortOrderOverride, defaultSortOrder } = params
    sortFunction(data, { sortBy: field, sortOrder: sortOrderOverride }, defaultSortOrder)
  }

  const buildHeaderVariant = useCallback((column: string) => {
    return sortParams.sortBy === column ? undefined : 'subtle'
  }, [sortParams.sortBy])

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
                    <SortArrows className='Layer__DetailedTable__sortArrows' />
                  </HStack>
                </th>
                {!isMobile && (
                  <th
                    className={classNames(
                      'Layer__DetailedTable__SortableColumn',
                      sortParams.sortBy === 'type' && sortParams.sortOrder && `Layer__DetailedTable__SortableColumn--sort--${sortParams.sortOrder.toLowerCase()}`,
                    )}
                    onClick={() => setAndToggleSortDirection({ field: 'type' })}
                  >
                    <HStack align='center' gap='3xs'>
                      <Span variant={buildHeaderVariant('type')} size='sm'>
                        {stringOverrides?.typeColumnHeader || t('common:label.type', 'Type')}
                      </Span>
                      <SortArrows className='Layer__DetailedTable__sortArrows' />
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
                    <SortArrows className='Layer__DetailedTable__sortArrows' />
                  </HStack>
                </th>
                <th className='percent-col'></th>
              </tr>
            </thead>
            <tbody>
              {detailedTableRows
                .map((row) => {
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
                      <td className='color-col'>
                        <ValueIcon<T> item={row.item} {...stylingProps} />
                      </td>
                      <td className='category-col'>
                        <Span size='sm'>{row.item.displayName}</Span>
                      </td>
                      {!isMobile && (
                        <td className='type-col'>
                          <Span variant={isRowActive ? undefined : 'subtle'} size='sm'>{row.item.type}</Span>
                        </td>
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
