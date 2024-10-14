import React, { RefObject, useContext, useMemo, useState } from 'react'
import { BillsContext } from '../../contexts/BillsContext'
import { BillType } from '../../hooks/useBills/useBills'
import { View } from '../../types/general'
import { BillsSidebar } from '../BillsSidebar'
import { Button } from '../Button'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Select } from '../Input'
import { Pagination } from '../Pagination'
import { Panel } from '../Panel'
import { Toggle } from '../Toggle'
import { BillsTable } from './BillsTable'

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
  activeTab,
  setActiveTab,
  stringOverrides,
  view,
}: {
  view: View
  containerRef: RefObject<HTMLDivElement>
  pageSize?: number
  stringOverrides?: BillsTableStringOverrides
  activeTab: string
  setActiveTab: (id: string) => void
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const { data: rawData, selectedEntryId } = useContext(BillsContext)
  const [bulkRecordPayment, setBulkRecordPayment] = useState(false)
  const [selectedEntries, setSelectedEntries] = useState<BillType[]>([])

  const data = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize
    const lastPageIndex = firstPageIndex + pageSize
    return rawData?.slice(firstPageIndex, lastPageIndex)
  }, [rawData, currentPage])

  return (
    <Panel
      sidebar={<BillsSidebar parentRef={containerRef} />}
      sidebarIsOpen={Boolean(selectedEntryId)}
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
                  value: 'unpaid',
                  label: stringOverrides?.unpaidToggleOption || 'Unpaid',
                },
                {
                  value: 'paid',
                  label: stringOverrides?.paidToggleOption || 'Paid',
                },
              ]}
              selected={activeTab}
              onChange={opt => setActiveTab(opt.target.value)}
            />
          </HeaderCol>
        </HeaderRow>
        {activeTab === 'unpaid' && (
          <HeaderRow>
            <HeaderCol style={{ paddingLeft: 0, paddingRight: 0 }}>
              {bulkRecordPayment ? (
                <Select
                  options={data?.map(entry => ({
                    value: entry.vendor,
                    label: entry.vendor,
                  }))}
                  onChange={selectedOption => {
                    const selectedEntry = data?.find(
                      entry => entry.vendor === selectedOption.value,
                    )
                    if (selectedEntry) {
                      setSelectedEntries([...selectedEntries, selectedEntry])
                    }
                  }}
                  placeholder='Select vendor to record bulk payment'
                />
              ) : (
                <Button onClick={() => setBulkRecordPayment(true)}>
                  Bulk record payments
                </Button>
              )}
            </HeaderCol>
          </HeaderRow>
        )}
      </Header>

      {data && (
        <BillsTable
          view={'desktop'}
          data={data}
          activeTab={activeTab}
          bulkRecordPayment={bulkRecordPayment}
          selectedEntries={selectedEntries}
          setSelectedEntries={setSelectedEntries}
        />
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
