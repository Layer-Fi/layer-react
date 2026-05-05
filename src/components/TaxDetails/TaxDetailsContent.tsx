import { type ReactNode, useMemo } from 'react'
import { type Row } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { isCurrencyCellValue, isDecimalCellValue, isPercentageCellValue } from '@schemas/reports/unifiedReport'
import { type TaxDetailsRow } from '@schemas/taxEstimates/details'
import { asMutable } from '@utils/asMutable'
import { useTaxDetails } from '@hooks/api/businesses/[business-id]/tax-estimates/details/useTaxDetails'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { type NestedColumnConfig } from '@components/DataTable/columnUtils'
import { ExpandableDataTable } from '@components/ExpandableDataTable/ExpandableDataTable'
import { ExpandableDataTableProvider } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { Loader } from '@components/Loader/Loader'
import { Operator } from '@components/TaxDetails/Operator/Operator'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

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
      title={t('taxEstimates:empty.no_tax_details', 'No tax details')}
      description={t('taxEstimates:empty.no_tax_details_description', 'No tax details found')}
      spacing
    />
  )
}

const ErrorState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      status={DataStateStatus.failed}
      title={t('taxEstimates:error.load_tax_details', 'We couldn\'t load your tax details')}
      description={t('taxEstimates:error.while_loading_tax_details', 'An error occurred while loading your tax details. Please check your connection and try again.')}
      spacing
    />
  )
}

const TaxDetailsRowLabelCell = (row: Row<TaxDetailsRow>) => {
  const hasOperator = row.original.operator !== undefined && row.original.operator !== null
  if (hasOperator) {
    return (
      <HStack className='Layer__TaxDetails__TaxDetailsRow--operator' align='center' gap='md'>
        <Operator sign={row.original.operator} />
        <Span>{row.original.label}</Span>
      </HStack>
    )
  }

  return <Span>{row.original.label}</Span>
}

type AmountCellRendererDeps = Pick<ReturnType<typeof useIntlFormatter>, 'formatNumber' | 'formatPercent'>

const makeAmountCellRenderer = ({ formatNumber, formatPercent }: AmountCellRendererDeps) => {
  return function TaxDetailsAmountCell(row: Row<TaxDetailsRow>) {
    const { value } = row.original
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

const useColumnConfig = (): NestedColumnConfig<TaxDetailsRow> => {
  const { t } = useTranslation()
  const { formatNumber, formatPercent } = useIntlFormatter()

  return useMemo(() => [
    {
      id: TaxDetailsColumns.Label,
      header: t('taxEstimates:label.tax_details_label', 'Label'),
      cell: TaxDetailsRowLabelCell,
      isRowHeader: true,
    },
    {
      id: TaxDetailsColumns.Amount,
      header: t('taxEstimates:label.tax_details_amount', 'Amount'),
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
  const { data, isLoading, isError } = useTaxDetails({ year, fullYearProjection })
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
                ariaLabel={t('taxEstimates:label.tax_details', 'Tax Details')}
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
