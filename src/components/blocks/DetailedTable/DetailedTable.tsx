import { useCallback } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { SortOrder, type SortParams } from '@internal-types/utility/pagination'
import { createOwnLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import SortArrows from '@icons/SortArrows'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Button } from '@ui/Button/Button'
import { type ColorSelector, type DetailData, type SeriesData } from '@ui/Chart/seriesTypes'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { type FallbackFillSelector } from '@blocks/DetailedChart/types'

import './detailedTable.scss'

import { type DetailedTableRow, useDetailedTableRows } from './useDetailedTableRows'
import { ValueIcon } from './ValueIcon'

type SortableColumn = 'category' | 'type' | 'value'
type DetailedTableColumn = SortableColumn | 'color' | 'percent'

const legacyClassNames = createOwnLegacyClassNames<
  `state:${string}` | `column:${DetailedTableColumn}` | 'sortColumn:value' | `sortOrder:${SortOrder}`
>()({
  'Layer__DetailedTable__Container': 'Layer__DetailedTable__container',
  'Layer__DetailedTable__Table': 'Layer__DetailedTable__table',
  'Layer__DetailedTable__Row': 'Layer__DetailedTable__row',
  'Layer__DetailedTable__SortableColumn': 'Layer__sortable-col',
  'Layer__DetailedTable__SortArrows': ['Layer__DetailedTable__sortArrows', 'Layer__sort-arrows'],
  'state:sortable': 'Layer__DetailedTable__table--sortable',
  'state:active': 'active',
  'column:color': 'Layer__DetailedTable__Column--color',
  'column:category': 'Layer__DetailedTable__Column--category',
  'column:type': 'Layer__DetailedTable__Column--type',
  'column:value': 'Layer__DetailedTable__Column--value',
  'column:percent': 'Layer__DetailedTable__Column--percent',
  'sortColumn:value': 'Layer__DetailedTable__SortableColumn--value',
  'sortOrder:ASC': 'Layer__DetailedTable__SortableColumn--sortasc',
  'sortOrder:ASCENDING': 'Layer__DetailedTable__SortableColumn--sortascending',
  'sortOrder:DES': 'Layer__DetailedTable__SortableColumn--sortdes',
  'sortOrder:DESC': 'Layer__DetailedTable__SortableColumn--sortdesc',
  'sortOrder:DESCENDING': 'Layer__DetailedTable__SortableColumn--sortdescending',
})

const cellProperties = (column: DetailedTableColumn) => ({
  className: classNames('Layer__DetailedTable__Column', legacyClassNames(`column:${column}`)),
  ...toDataProperties({ column }),
})

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
    fallbackFillColor?: string
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

// Compared by identity below to decide whether the table renders sort controls.
export const NO_OP_INTERACTION_PROPS = {
  hoveredItem: undefined,
  setHoveredItem: () => {},
}

export const NO_SORT_PROPS: Pick<DetailedTableProps<SeriesData>, 'sortParams' | 'sortFunction'> = {
  sortParams: { sortBy: 'value' },
  sortFunction: () => {},
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

  const { isMobile, isDesktop } = useSizeClass()
  const hasType = showTypeColumn && rows.length > 0 && rows.map(r => r.item.type).every(type => type !== undefined)
  const isSortable = interactionProps !== NO_OP_INTERACTION_PROPS

  const buildHeaderVariant = useCallback((column: string) => {
    return sortParams.sortBy === column ? undefined : 'subtle'
  }, [sortParams.sortBy])

  const sortableHeaderProperties = (column: SortableColumn) => {
    const sortOrder = sortParams.sortBy === column ? sortParams.sortOrder : undefined

    return {
      className: legacyClassNames(
        'Layer__DetailedTable__SortableColumn',
        column === 'value' && 'sortColumn:value',
        sortOrder && `sortOrder:${sortOrder}`,
      ),
      ...toDataProperties({ column, sort: sortOrder ?? false }),
    }
  }

  return (
    <VStack className='Layer__DetailedTable'>
      <VStack className={legacyClassNames('Layer__DetailedTable__Container')} pi='md' pbs='2xs' pbe={isDesktop ? 'md' : undefined}>
        <VStack
          className={legacyClassNames('Layer__DetailedTable__Table', isSortable && 'state:sortable')}
          {...toDataProperties({ sortable: isSortable })}
        >
          <table>
            <thead>
              <tr>
                <th></th>
                <th
                  {...sortableHeaderProperties('category')}
                  onClick={() => setAndToggleSortDirection({ field: 'category' })}
                >
                  <HStack align='center' gap='3xs'>
                    <Span variant={buildHeaderVariant('category')} size='sm'>
                      {stringOverrides?.categoryColumnHeader || t('common:label.category', 'Category')}
                    </Span>
                    {isSortable && <SortArrows className={legacyClassNames('Layer__DetailedTable__SortArrows')} />}
                  </HStack>
                </th>
                {!isMobile && hasType && (
                  <th
                    {...sortableHeaderProperties('type')}
                    onClick={() => setAndToggleSortDirection({ field: 'type' })}
                  >
                    <HStack align='center' gap='3xs'>
                      <Span variant={buildHeaderVariant('type')} size='sm'>
                        {stringOverrides?.typeColumnHeader || t('common:label.type', 'Type')}
                      </Span>
                      {isSortable && <SortArrows className={legacyClassNames('Layer__DetailedTable__SortArrows')} />}
                    </HStack>
                  </th>
                )}
                <th
                  {...sortableHeaderProperties('value')}
                  onClick={() => setAndToggleSortDirection({ field: 'value', defaultSortOrder: SortOrder.DESC })}
                >
                  <HStack align='center' gap='3xs' justify='end'>
                    <Span variant={buildHeaderVariant('value')} size='sm'>
                      {stringOverrides?.valueColumnHeader || t('common:label.value', 'Value')}
                    </Span>
                    {isSortable && <SortArrows className={legacyClassNames('Layer__DetailedTable__SortArrows')} />}
                  </HStack>
                </th>
                <th {...toDataProperties({ column: 'percent' })} className={legacyClassNames('column:percent')}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isRowActive = interactionProps.hoveredItem?.name === row.item.name
                return (
                  <tr
                    key={row.key}
                    className={legacyClassNames('Layer__DetailedTable__Row', isRowActive && 'state:active')}
                    {...toDataProperties({ active: isRowActive })}
                    onMouseEnter={() => interactionProps.setHoveredItem(row.item)}
                    onMouseLeave={() => interactionProps.setHoveredItem(undefined)}
                  >
                    <td {...cellProperties('color')}>
                      <ValueIcon<T> item={row.item} {...stylingProps} />
                    </td>
                    <td {...cellProperties('category')}>
                      <Span size='sm'>{row.item.displayName}</Span>
                    </td>
                    {!isMobile && hasType && (
                      <td {...cellProperties('type')}>
                        <Span variant={isRowActive ? undefined : 'subtle'} size='sm'>{row.item.type}</Span>
                      </td>
                    )}
                    <td {...cellProperties('value')}>
                      <Button
                        variant='text'
                        onPress={() => interactionProps.onValueClick?.(row.item)}
                        isDisabled={!interactionProps.onValueClick || row.isValueDisabled}
                      >
                        <MoneySpan size='sm' align='right' amount={row.item.value} />
                      </Button>
                    </td>
                    <td {...cellProperties('percent')}>
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
