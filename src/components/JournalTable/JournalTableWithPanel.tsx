import React, { RefObject, useContext, useMemo, useState } from 'react'
import { JournalContext } from '../../contexts/JournalContext'
import PlusIcon from '../../icons/PlusIcon'
import { Button } from '../Button'
import { DataState, DataStateStatus } from '../DataState'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { View } from '../../types/general'
import { JournalConfig } from '../Journal/Journal'
import { JournalFormStringOverrides } from '../JournalForm/JournalForm'
import { JournalSidebar } from '../JournalSidebar'
import { Loader } from '../Loader'
import { Pagination } from '../Pagination'
import { Panel } from '../Panel'
import { Heading, HeadingSize } from '../Typography'
import { JournalTable } from './JournalTable'

export interface JournalTableStringOverrides {
  componentTitle?: string
  componentSubtitle?: string
  addEntryButton?: string
  idColumnHeader?: string
  dateColumnHeader?: string
  transactionColumnHeader?: string
  accountColumnHeader?: string
  debitColumnHeader?: string
  creditColumnHeader?: string
  journalForm?: JournalFormStringOverrides
}

const COMPONENT_NAME = 'journal'

export const JournalTableWithPanel = ({
  containerRef,
  pageSize = 15,
  config,
  stringOverrides,
  view,
}: {
  view: View
  containerRef: RefObject<HTMLDivElement>
  pageSize?: number
  config: JournalConfig
  stringOverrides?: JournalTableStringOverrides
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const {
    data: rawData,
    isLoading,
    error,
    isValidating,
    refetch,
    selectedEntryId,
    addEntry,
  } = useContext(JournalContext)

  const data = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize
    const lastPageIndex = firstPageIndex + pageSize
    return rawData
      ?.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      ?.slice(firstPageIndex, lastPageIndex)
  }, [rawData, currentPage])

  return (
    <Panel
      sidebar={
        <JournalSidebar
          parentRef={containerRef}
          config={config}
          stringOverrides={stringOverrides?.journalForm}
        />
      }
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
          <HeaderCol>
            <Heading className={`Layer__${COMPONENT_NAME}__title`}>
              {stringOverrides?.componentTitle || 'Journal'}
            </Heading>
          </HeaderCol>
        </HeaderRow>
      </Header>
      <Header>
        <HeaderRow>
          <HeaderCol>
            <Heading
              size={HeadingSize.secondary}
              className={`Layer__${COMPONENT_NAME}__subtitle`}
            >
              {stringOverrides?.componentSubtitle || 'Entries'}
            </Heading>
          </HeaderCol>
          <HeaderCol>
            <Button
              onClick={() => addEntry()}
              disabled={isLoading}
              iconOnly={view === 'mobile'}
              leftIcon={view === 'mobile' && <PlusIcon size={14} />}
            >
              {stringOverrides?.addEntryButton || 'Add Entry'}
            </Button>
          </HeaderCol>
        </HeaderRow>
      </Header>

      {data && <JournalTable view={'desktop'} data={data} />}

      {data && (
        <div className='Layer__journal__pagination'>
          <Pagination
            currentPage={currentPage}
            totalCount={rawData?.length || 0}
            pageSize={pageSize}
            onPageChange={page => setCurrentPage(page)}
          />
        </div>
      )}

      {data?.length === 0 && !isLoading && !error && (
        <div className='Layer__table-state-container'>
          <DataState
            status={DataStateStatus.allDone}
            title='No entries found'
            description='There are no entries in the journal.'
          />
        </div>
      )}

      {error ? (
        <div className='Layer__table-state-container'>
          <DataState
            status={DataStateStatus.failed}
            title='Something went wrong'
            description='We couldn’t load your data.'
            onRefresh={() => refetch()}
            isLoading={isValidating || isLoading}
          />
        </div>
      ) : null}

      {(!data || isLoading) && !error ? (
        <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
          <Loader />
        </div>
      ) : null}
    </Panel>
  )
}
