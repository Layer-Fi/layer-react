import React, { RefObject, useMemo, useState } from 'react'
import { useBillsContext, useBillsRecordPaymentContext } from '../../contexts/BillsContext'
import { BillsSidebar } from './BillsSidebar'
import { Button, CloseButton, IconButton } from '../Button'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Select } from '../Input'
import { Pagination } from '../Pagination'
import { Panel } from '../Panel'
import { Toggle } from '../Toggle'
import { BillsTable } from './BillsTable'
import CloseIcon from '../../icons/CloseIcon'
import { BillStatusFilter } from '../../types/bills'

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
  const { data: rawData, status, setStatus } = useBillsContext()
  const {
    bulkSelectionActive,
    setBulkSelectionActive,
    showRecordPaymentForm,
  } = useBillsRecordPaymentContext()

  /** @TODO - temp pagiantion - based on the API, consider moving to Bills context */
  const data = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize
    const lastPageIndex = firstPageIndex + pageSize
    return rawData?.slice(firstPageIndex, lastPageIndex)
  }, [rawData, currentPage])

  return (
    <Panel
      sidebar={<BillsSidebar parentRef={containerRef} />}
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
          <HeaderCol style={{ paddingLeft: 0, paddingRight: 0 }}>
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
          <HeaderRow>
            <HeaderCol style={{ paddingLeft: 0, paddingRight: 0 }}>
              {bulkSelectionActive
                ? (
                  <>
                    <Select
                      options={data?.map(entry => ({
                        value: entry.vendor,
                        label: entry.vendor,
                      }))}
                      onChange={(selectedOption) => {
                        const selectedEntry = data?.find(
                          entry => entry.vendor === selectedOption.value,
                        )
                      }}
                      placeholder='Select vendor to record bulk payment'
                    />
                    <IconButton
                      icon={<CloseIcon />}
                      onClick={() => setBulkSelectionActive(false)}
                    />
                  </>
                )
                : (
                  <Button onClick={() => setBulkSelectionActive(true)}>
                    Bulk record payments
                  </Button>
                )}
            </HeaderCol>
          </HeaderRow>
        )}
      </Header>

      {data && (
        <BillsTable />
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
