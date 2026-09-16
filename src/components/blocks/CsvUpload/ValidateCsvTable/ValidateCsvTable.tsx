import { useMemo } from 'react'
import { type Row } from '@tanstack/react-table'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type PreviewCell, type PreviewCsv, type PreviewRow } from '@schemas/common/csvUpload'
import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { type ColumnConfig } from '@blocks/Table/DataTable/utils/column'
import { VirtualizedDataTable } from '@blocks/Table/VirtualizedDataTable/VirtualizedDataTable'

import './validateCsvTable.scss'

const LEGACY_PREFIX = 'Layer__csv-upload__validate-csv-table'

const legacyClassNames = createLegacyClassNames({
  'Layer__CsvUpload__Table__wrapper': `${LEGACY_PREFIX}__container`,
  'Layer__CsvUpload__Table__cell-content': `${LEGACY_PREFIX}__cell-content`,
  'Layer__CsvUpload__Table__cell-content--row': `${LEGACY_PREFIX}__cell-content--row`,
  'Layer__CsvUpload__Table__cell-content--error': `${LEGACY_PREFIX}__cell-content--error`,
  'Layer__CsvUpload__Table__header-cell-content': `${LEGACY_PREFIX}__header-cell-content`,
  'Layer__CsvUpload__Table__header-cell-content--row': `${LEGACY_PREFIX}__header-cell-content--row`,
})

const getLegacyClassNames = (columnId: string) => ({
  cell: `${LEGACY_PREFIX}__cell ${LEGACY_PREFIX}__cell--${columnId}`,
  column: `${LEGACY_PREFIX}__header-cell ${LEGACY_PREFIX}__header-cell--${columnId}`,
})

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
        if (a.isValid !== b.isValid) return a.isValid ? 1 : -1
        return a.row - b.row
      })
      .map(row => ({ ...row, id: String(row.row) })),
    [data],
  )

  const columnConfig = useMemo<ColumnConfig<DataRow<T>>>(
    () => [
      {
        id: 'row',
        header: <span className={legacyClassNames('Layer__CsvUpload__Table__header-cell-content', 'Layer__CsvUpload__Table__header-cell-content--row')}>{t('common:label.row', 'Row')}</span>,
        cell: (row: Row<DataRow<T>>) => (
          <span className={classNames(
            legacyClassNames(
              'Layer__CsvUpload__Table__cell-content',
              'Layer__CsvUpload__Table__cell-content--row',
            ),
            !row.original.isValid && 'Layer__CsvUpload__Table__cell-content--row-error',
          )}
          >
            {row.original.row}
          </span>
        ),
        isRowHeader: true,
        legacyClassNames: getLegacyClassNames('row'),
      },
      ...(Object.keys(headers) as (keyof T & string)[]).map(key => ({
        id: key,
        header: <span className={legacyClassNames('Layer__CsvUpload__Table__header-cell-content')}>{headers[key]}</span>,
        cell: (row: Row<DataRow<T>>) => {
          const field = row.original[key] as PreviewCell<T[typeof key]>

          let value: string | number | null | undefined = field?.raw
          const isValid = field && field.isValid
          if (isValid && field.parsed != null) {
            const formatter = formatters?.[key]
            value = formatter ? formatter(field.parsed) : field.parsed
          }
          return (
            <span className={classNames(
              legacyClassNames(
                'Layer__CsvUpload__Table__cell-content',
                !isValid && 'Layer__CsvUpload__Table__cell-content--error',
              ),
              !row.original.isValid && 'Layer__CsvUpload__Table__cell-content--row-error',
            )}
            >
              {value}
            </span>
          )
        },
        legacyClassNames: getLegacyClassNames(key),
      })),
    ],
    [t, headers, formatters],
  )

  return (
    <div className={classNames(legacyClassNames('Layer__CsvUpload__Table__wrapper'), className)}>
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
