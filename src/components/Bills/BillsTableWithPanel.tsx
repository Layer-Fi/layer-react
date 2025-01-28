import { RefObject, useMemo, useState } from 'react'
import { useBillsContext, useBillsRecordPaymentContext } from '../../contexts/BillsContext'
import { BillsSidebar } from './BillsSidebar'
import { Button, IconButton } from '../Button'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Pagination } from '../Pagination'
import { Panel } from '../Panel'
import { Toggle } from '../Toggle'
import { BillsTable } from './BillsTable'
import CloseIcon from '../../icons/CloseIcon'
import { BillStatusFilter } from '../../hooks/useBills'
import { SelectVendor } from '../Vendors/SelectVendor'
import { useSizeClass } from '../../hooks/useWindowSize'
import { BillsList } from './BillsList'

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
  pageSize = 15,
  stringOverrides,
}: {
  containerRef: RefObject<HTMLDivElement>
  pageSize?: number
  stringOverrides?: BillsTableStringOverrides
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const { data: rawData, status, setStatus, vendor, setVendor } = useBillsContext()
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

  /** @TODO - temp pagiantion - based on the API, consider moving to Bills context */
  const data = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize
    const lastPageIndex = firstPageIndex + pageSize
    return rawData?.slice(firstPageIndex, lastPageIndex)
  }, [currentPage, pageSize, rawData])

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
                      }}
                      placeholder='Select vendor to record bulk payment'
                    />
                    <IconButton
                      icon={<CloseIcon />}
                      onClick={() => {
                        setVendor(null)
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

      {data && (
        <div className='Layer__bills__pagination'>
          <Pagination
            currentPage={currentPage}
            totalCount={rawData?.length || 0}
            pageSize={pageSize}
            onPageChange={page => setCurrentPage(page)}
          />
        </div>
      )}
    </Panel>
  )
}
