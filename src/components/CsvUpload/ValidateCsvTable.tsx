import { useMemo } from 'react'
import { type Row } from '@tanstack/react-table'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type PreviewCell, type PreviewCsv, type PreviewRow } from '@components/CsvUpload/types'
import { type NestedColumnConfig } from '@components/DataTable/columnUtils'
import { VirtualizedDataTable } from '@components/VirtualizedDataTable/VirtualizedDataTable'

const ROW_HEIGHT = 52
const MAX_NUM_ROWS = 8
const TABLE_HEIGHT = ROW_HEIGHT * (MAX_NUM_ROWS + 1) - 1

const EmptyState: React.FC = () => null
const ErrorState: React.FC = () => null

type DataRow<T extends { [K in keyof T]: string | number | null | undefined }> =
  PreviewRow<T> & { id: string }

interface ValidateCsvTableProps<T extends { [K in keyof T]: string | number | null | undefined }> {
  data: PreviewCsv<T>
  headers: { [K in keyof T]: string }
  formatters?: Partial<{ [K in keyof T]: (parsed: T[K]) => string }>
  className?: string
}

export function ValidateCsvTable<T extends { [K in keyof T]: string | number | null | undefined }>({
  data,
  headers,
  formatters,
  className,
}: ValidateCsvTableProps<T>) {
  const { t } = useTranslation()
  const sortedData = useMemo<DataRow<T>[]>(
    () => [...data]
      .sort((a, b) => {
        if (a.is_valid !== b.is_valid) return a.is_valid ? 1 : -1
        return a.row - b.row
      })
      .map(row => ({ ...row, id: String(row.row) })),
    [data],
  )

  const columnConfig = useMemo<NestedColumnConfig<DataRow<T>>>(
    () => [
      {
        id: 'row',
        header: <span className='Layer__CsvUpload__Table__header-cell-content Layer__CsvUpload__Table__header-cell-content--row'>{t('common:label.row', 'Row')}</span>,
        cell: (row: Row<DataRow<T>>) => (
          <span className={classNames(
            'Layer__CsvUpload__Table__cell-content',
            'Layer__CsvUpload__Table__cell-content--row',
            !row.original.is_valid && 'Layer__CsvUpload__Table__cell-content--row-error',
          )}
          >
            {row.original.row}
          </span>
        ),
        isRowHeader: true,
      },
      ...(Object.keys(headers) as (keyof T & string)[]).map(key => ({
        id: key,
        header: <span className='Layer__CsvUpload__Table__header-cell-content'>{headers[key]}</span>,
        cell: (row: Row<DataRow<T>>) => {
          const field = row.original[key] as PreviewCell<T[typeof key]>

          let value: string | number | null | undefined = field?.raw
          const isValid = field && field.is_valid
          if (isValid) {
            const formatter = formatters?.[key]
            value = formatter ? formatter(field.parsed) : field.parsed
          }
          return (
            <span className={classNames(
              'Layer__CsvUpload__Table__cell-content',
              !row.original.is_valid && 'Layer__CsvUpload__Table__cell-content--row-error',
              !isValid && 'Layer__CsvUpload__Table__cell-content--error',
            )}
            >
              {value}
            </span>
          )
        },
      })),
    ],
    [t, headers, formatters],
  )

  return (
    <div className={classNames('Layer__CsvUpload__Table__wrapper', className)}>
      <VirtualizedDataTable<DataRow<T>>
        componentName='ValidateCsvTable'
        ariaLabel={t('upload:label.csv_validation_preview', 'CSV validation preview')}
        columnConfig={columnConfig}
        data={sortedData}
        isLoading={false}
        isError={false}
        height={TABLE_HEIGHT}
        rowHeight={ROW_HEIGHT}
        shrinkHeightToFitRows
        slots={{ EmptyState, ErrorState }}
      />
    </div>
  )
}
