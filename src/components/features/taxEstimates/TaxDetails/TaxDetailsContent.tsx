import { type ReactNode, useMemo } from 'react'
import { type Row } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { type TaxDetailsRow } from '@schemas/features/taxEstimates/details'
import { isCurrencyCellValue, isDecimalCellValue, isPercentageCellValue } from '@schemas/features/unifiedReports/unifiedReport'
import { asMutable } from '@utils/shared/array/asMutable'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useGetTaxDetails } from '@api/businesses/[business-id]/tax-estimates/details/get'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/features/taxEstimates/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import { Card } from '@ui/Card/Card'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { Loader } from '@ui/Loader/Loader'
import { VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { type ColumnConfig } from '@blocks/Table/DataTable/utils/column'
import { ExpandableDataTable } from '@blocks/Table/ExpandableDataTable/ExpandableDataTable'
import { ExpandableDataTableProvider } from '@blocks/Table/ExpandableDataTable/ExpandableDataTableProvider'

enum TaxDetailsColumns {
  Label = 'Label',
  Amount = 'Amount',
}

const COMPONENT_NAME = 'TaxDetails'
const MobileExpandableCardsWrapper = ({ children, className }: { children: ReactNode, className?: string }) => (
  <Card className={`Layer__card--reset ${className ?? ''}`}>{children}</Card>
)

const EmptyState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      status={DataStateStatus.allDone}
      title={t('taxEstimates:TaxDetails.empty.no_tax_details', 'No tax details')}
      description={t('taxEstimates:TaxDetails.empty.no_tax_details_description', 'No tax details found')}
      spacing
    />
  )
}

const ErrorState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      status={DataStateStatus.failed}
      title={t('taxEstimates:TaxDetails.error.load_tax_details', 'We couldn’t load your tax details')}
      description={t('taxEstimates:TaxDetails.error.while_loading_tax_details', 'An error occurred while loading your tax details. Please check your connection and try again.')}
      spacing
    />
  )
}

const TaxDetailsRowLabelCell = (row: Row<TaxDetailsRow>) => {
  const { operator, label } = row.original
  const isTotal = operator === '='

  if (isTotal) {
    return <Span className='Layer__TaxDetails__TaxDetailsRow--total'>{label}</Span>
  }

  return <Span>{label}</Span>
}

type AmountCellRendererDeps = Pick<ReturnType<typeof useIntlFormatter>, 'formatNumber' | 'formatPercent'>

const makeAmountCellRenderer = ({ formatNumber, formatPercent }: AmountCellRendererDeps) => {
  return function TaxDetailsAmountCell(row: Row<TaxDetailsRow>) {
    const { value } = row.original
    if (row.getCanExpand() && row.getIsExpanded()) return null
    if (value === undefined) return <Span>-</Span>

    if (isPercentageCellValue(value)) {
      return <Span>{formatPercent(value.value, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</Span>
    }
    if (isCurrencyCellValue(value)) {
      return <MoneySpan amount={value.value} />
    }
    if (isDecimalCellValue(value)) {
      return <Span>{formatNumber(value.value, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}</Span>
    }

    const raw = value.value
    if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
      return <Span>{String(raw)}</Span>
    }

    return <Span>-</Span>
  }
}

const useColumnConfig = (): ColumnConfig<TaxDetailsRow> => {
  const { t } = useTranslation()
  const { formatNumber, formatPercent } = useIntlFormatter()

  return useMemo(() => [
    {
      id: TaxDetailsColumns.Label,
      header: t('taxEstimates:TaxDetails.label.tax_details_label', 'Label'),
      cell: TaxDetailsRowLabelCell,
      isRowHeader: true,
    },
    {
      id: TaxDetailsColumns.Amount,
      header: t('taxEstimates:TaxDetails.label.tax_details_amount', 'Amount'),
      cell: makeAmountCellRenderer({ formatNumber, formatPercent }),
    },
  ], [t, formatNumber, formatPercent])
}

const getSubRows = (row: TaxDetailsRow): TaxDetailsRow[] | undefined => {
  return row.breakdown ? asMutable(row.breakdown) : undefined
}

const getRowId = (row: TaxDetailsRow): string => {
  return row.rowKey
}

export function TaxDetailsContent() {
  const { t } = useTranslation()
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { data, isLoading, isError } = useGetTaxDetails({ year, fullYearProjection })
  const { isDesktop } = useSizeClass()
  const columnConfig = useColumnConfig()

  const ExpandableCardsWrapper = isDesktop ? VStack : MobileExpandableCardsWrapper

  return (
    <ConditionalBlock
      isLoading={isLoading}
      isError={isError}
      data={data}
      Loading={<Loader />}
      Error={<ErrorState />}
    >
      {({ data: details }) => {
        return (
          <ExpandableCardsWrapper className='Layer__TaxDetails__ExpandableCardsWrapper'>
            <ExpandableDataTableProvider>
              <ExpandableDataTable<TaxDetailsRow>
                componentName={COMPONENT_NAME}
                ariaLabel={t('taxEstimates:TaxDetails.label.tax_details', 'Tax Details')}
                data={asMutable(details.rows)}
                columnConfig={columnConfig}
                isLoading={isLoading}
                isError={isError}
                indentSize={isDesktop ? 'sm' : 'xs'}
                slots={{
                  EmptyState,
                  ErrorState,
                }}
                getSubRows={getSubRows}
                getRowId={getRowId}
              />
            </ExpandableDataTableProvider>
          </ExpandableCardsWrapper>
        )
      }}
    </ConditionalBlock>
  )
}
