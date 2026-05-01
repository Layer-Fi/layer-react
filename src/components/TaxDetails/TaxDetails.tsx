import { type Row } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { type TaxDetailsRow } from '@schemas/taxEstimates/details'
import { asMutable } from '@utils/asMutable'
import { useTaxDetails } from '@hooks/api/businesses/[business-id]/tax-estimates/details/useTaxDetails'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { type NestedColumnConfig } from '@components/DataTable/columnUtils'
import { ExpandableDataTable } from '@components/ExpandableDataTable/ExpandableDataTable'
import { ExpandableDataTableProvider } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { Loader } from '@components/Loader/Loader'
import { ResponsiveDetailView } from '@components/ResponsiveDetailView/ResponsiveDetailView'
import { Operator } from '@components/TaxDetails/Operator/Operator'
import { TaxSummaryCard } from '@components/TaxDetails/TaxSummaryCard/TaxSummaryCard'
import { TaxEstimatesHeader, TaxEstimatesHeaderType } from '@components/TaxEstimates/TaxEstimatesHeader'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

import './taxDetails.scss'

const TaxDetailsHeader = () => <TaxEstimatesHeader type={TaxEstimatesHeaderType.Estimates} />

const COMPONENT_NAME = 'TaxDetails'
const MobileExpandableCardsWrapper = ({ children }: { children: ReactNode }) => (
  <Card className='Layer__TaxDetails__ExpandableCardsWrapper'>{children}</Card>
)

enum TaxDetailsColumns {
  Label = 'Label',
  Amount = 'Amount',
}

const columnConfig: NestedColumnConfig<TaxDetailsRow> = [
  {
    id: TaxDetailsColumns.Label,
    header: 'Label',
    cell: (row: Row<TaxDetailsRow>) => <Span>{row.original.label}</Span>,
    isRowHeader: true,
  },
  {
    id: TaxDetailsColumns.Amount,
    header: 'Amount',
    cell: (row: Row<TaxDetailsRow>) => {
      if (row.original.rate !== undefined) return (
        <Span>
          {row.original.rate}
          %
        </Span>
      )

      return <MoneySpan amount={row.original.amount ?? 0} />
    },
  },
]

const getSubRows = (row: TaxDetailsRow): TaxDetailsRow[] | undefined => {
  return row.breakdown ? asMutable(row.breakdown) : undefined
}

const getRowId = (row: TaxDetailsRow): string => {
  return row.rowKey
}

export const TaxDetails = () => {
  const { t } = useTranslation()
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { data, isLoading, isError } = useTaxDetails({ year, fullYearProjection })
  const { isDesktop } = useSizeClass()

  const ExpandableCardsWrapper = isDesktop ? VStack : MobileExpandableCardsWrapper

  return (
    <ResponsiveDetailView
      name='TaxDetails'
      slots={{ Header: TaxDetailsHeader }}
      mobileProps={{ className: 'Layer__TaxDetails--mobile' }}
    >
      <TaxSummaryCard />
      <ConditionalBlock
        isLoading={isLoading}
        isError={isError}
        data={data}
        Loading={<Loader />}
        Error={(
          <DataState
            status={DataStateStatus.failed}
            title={t('taxEstimates:error.load_tax_estimates', 'We couldn\'t load your tax estimates')}
            description={t('taxEstimates:error.while_loading_tax_estimates', 'An error occurred while loading your tax estimates. Please check your connection and try again.')}
            spacing
          />
        )}
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
                  isLoading={false}
                  isError={false}
                  indentSize={isDesktop ? 'sm' : 'xs'}
                  slots={{
                    EmptyState: () => (
                      <DataState
                        status={DataStateStatus.allDone}
                        title={t('taxEstimates:empty.no_tax_details', 'No tax details')}
                        description={t('taxEstimates:empty.no_tax_details_description', 'No tax details found')}
                        spacing
                      />
                    ),
                    ErrorState: () => (
                      <DataState
                        status={DataStateStatus.failed}
                        title={t('taxEstimates:error.load_tax_details', 'We couldn\'t load your tax details')}
                        description={t('taxEstimates:error.while_loading_tax_details', 'An error occurred while loading your tax details. Please check your connection and try again.')}
                        spacing
                      />
                    ),
                  }}
                  getSubRows={getSubRows}
                  getRowId={getRowId}
                  renderFirstCellPrefix={(row: Row<TaxDetailsRow>) => row.original.operator ? <Operator sign={row.original.operator} /> : null}
                />
              </ExpandableDataTableProvider>
            </ExpandableCardsWrapper>
          )
        }}
      </ConditionalBlock>
    </ResponsiveDetailView>
  )
}
