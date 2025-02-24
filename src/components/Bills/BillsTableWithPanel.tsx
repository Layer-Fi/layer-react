import { RefObject, useMemo } from 'react'
import { useBillsContext, useBillsRecordPaymentContext } from '../../contexts/BillsContext'
import { BillsSidebar } from './BillsSidebar'
import { Button, IconButton } from '../Button'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Panel } from '../Panel'
import { Toggle } from '../Toggle'
import { BillsTable } from './BillsTable'
import CloseIcon from '../../icons/CloseIcon'
import { BillStatusFilter } from '../../hooks/useBills'
import { SelectVendor } from '../Vendors/SelectVendor'
import { useSizeClass } from '../../hooks/useWindowSize'
import { BillsList } from './BillsList'
import { Pagination } from '../Pagination'
import { DataState, DataStateStatus } from '../DataState'

export interface BillsTableStringOverrides {
  componentTitle?: string
  componentSubtitle?: string
  vendorColumnHeader?: string
  dueDateColumnHeader?: string
  billAmountColumnHeader?: string
  openBalanceColumnHeader?: string
  statusColumnHeader?: string
  paidToggleOption?: string
  unpaidToggleOption?: string
  recordPaymentButtonText?: string
}

const COMPONENT_NAME = 'bills'

export const BillsTableWithPanel = ({
  containerRef,
  stringOverrides,
}: {
  containerRef: RefObject<HTMLDivElement>
  stringOverrides?: BillsTableStringOverrides
}) => {
  const {
    data: rawData,
    paginatedData: data,
    currentPage,
    setCurrentPage,
    status,
    setStatus,
    vendor,
    setVendor,
    fetchMore,
    hasMore,
    pageSize,
    error,
    refetch,
    isLoading,
    deletePayment,
  } = useBillsContext()

  const {
    bulkSelectionActive,
    openBulkSelection,
    closeBulkSelection,
    showRecordPaymentForm,
    setShowRecordPaymentForm,
    billsToPay,
    setVendor: setRecordPaymentVendor,
  } = useBillsRecordPaymentContext()

  const { isDesktop, isMobile } = useSizeClass()

  const totalCount = useMemo(() => rawData?.length ?? 0, [rawData])

  const anyBillToPaySelected = useMemo(() => {
    return billsToPay.length > 0
  }, [billsToPay])

  return (
    <Panel
      sidebar={<BillsSidebar />}
      sidebarIsOpen={showRecordPaymentForm}
      parentRef={containerRef}
    >
      <Header
        className={`Layer__${COMPONENT_NAME}__header`}
        asHeader
        sticky
        rounded
      >
        <HeaderRow>
          <HeaderCol noPadding>
            <Toggle
              name='bills-tabs'
              options={[
                {
                  value: 'UNPAID',
                  label: stringOverrides?.unpaidToggleOption || 'Unpaid',
                },
                {
                  value: 'PAID',
                  label: stringOverrides?.paidToggleOption || 'Paid',
                },
              ]}
              selected={status}
              onChange={opt => setStatus(opt.target.value as BillStatusFilter)}
            />
            <button onClick={() => {
              deletePayment()
            }}
            >
              Delete payment
            </button>
          </HeaderCol>
        </HeaderRow>
        {status === 'UNPAID' && (
          <HeaderRow direction={isMobile ? 'col' : 'row'}>
            <HeaderCol noPadding>
              {bulkSelectionActive
                ? (
                  <>
                    <SelectVendor
                      value={vendor}
                      onChange={(vendor) => {
                        setVendor(vendor)
                        setRecordPaymentVendor(vendor ?? undefined)
                        setCurrentPage(1)
                      }}
                      placeholder='Select vendor to record bulk payment'
                    />
                    <IconButton
                      icon={<CloseIcon />}
                      onClick={() => {
                        setVendor(null)
                        setCurrentPage(1)
                        closeBulkSelection()
                      }}
                    />
                  </>
                )
                : (
                  <Button onClick={openBulkSelection}>
                    Bulk record payments
                  </Button>
                )}
            </HeaderCol>

            {bulkSelectionActive && (
              <HeaderCol noPadding>
                <Button
                  onClick={() => setShowRecordPaymentForm(true)}
                  disabled={!anyBillToPaySelected}
                >
                  Record payment
                </Button>
              </HeaderCol>
            )}
          </HeaderRow>
        )}
      </Header>

      {isDesktop && data && (
        <BillsTable />
      )}

      {!isDesktop && data && (
        <BillsList />
      )}

      {error && (
        <DataState
          status={DataStateStatus.failed}
          onRefresh={refetch}
          title='Something went wrong'
          description='We couldn’t load your data.'
          isLoading={isLoading}
          spacing
        />
      )}

      {!isLoading && !error && totalCount === 0
        ? (
          <DataState
            status={DataStateStatus.info}
            onRefresh={refetch}
            title={status === 'UNPAID' ? 'No unpaid bills to display' : 'No bills to display'}
            description={status === 'UNPAID' ? 'All unpaid bills will be displayed here' : 'All bills will be displayed here'}
            isLoading={isLoading}
            spacing
          />
        )
        : null}

      {data && (
        <Pagination
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={page => setCurrentPage(page)}
          fetchMore={fetchMore}
          hasMore={hasMore}
        />
      )}
    </Panel>
  )
}
