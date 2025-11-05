import { Heading, HeadingSize } from '../Typography/Heading'
import { HeaderRow } from '../Header/HeaderRow'
import { HeaderCol } from '../Header/HeaderCol'
import { Header } from '../Header/Header'
import { Button } from '../Button/Button'
import { RefObject, useContext, useMemo, useState } from 'react'
import { JournalContext } from '../../contexts/JournalContext/JournalContext'
import { useJournalNavigation } from '../../providers/JournalStore/JournalStoreProvider'
import PlusIcon from '../../icons/PlusIcon'
import { View } from '../../types/general'
import { DataState, DataStateStatus } from '../DataState/DataState'
import { JournalSidebar } from '../JournalSidebar/JournalSidebar'
import { Loader } from '../Loader/Loader'
import { Pagination } from '../Pagination/Pagination'
import { Panel } from '../Panel/Panel'
import { JournalTable } from './JournalTable'
import { JournalEntriesDownloadButton } from '../Journal/download/JournalEntriesDownloadButton'

const COMPONENT_NAME = 'journal-table'

export interface JournalTableStringOverrides {
  componentTitle?: string
  componentSubtitle?: string
  addEntryButton?: string
  idColumnHeader?: string
  dateColumnHeader?: string
  transactionColumnHeader?: string
  accountNumberColumnHeader?: string
  accountColumnHeader?: string
  debitColumnHeader?: string
  creditColumnHeader?: string
}

export const JournalTableWithPanel = ({
  containerRef,
  pageSize = 15,
  stringOverrides,
  view,
}: {
  view: View
  containerRef: RefObject<HTMLDivElement>
  pageSize?: number
  stringOverrides?: JournalTableStringOverrides
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const { toCreateEntry } = useJournalNavigation()

  const {
    data: rawData,
    isLoading,
    error,
    isValidating,
    refetch,
    selectedEntryId,
    hasMore,
    fetchMore,
  } = useContext(JournalContext)

  const data = useMemo(
    () => {
      if (!rawData) return undefined

      const firstPageIndex = (currentPage - 1) * pageSize
      const lastPageIndex = firstPageIndex + pageSize
      return rawData.slice(firstPageIndex, lastPageIndex)
    },
    [rawData, currentPage, pageSize],
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    if (rawData) {
      const requestedItemIndex = (page - 1) * pageSize + pageSize - 1
      const lastAvailableIndex = rawData.length - 1
      if (requestedItemIndex > lastAvailableIndex && hasMore) {
        fetchMore()
      }
    }
  }

  return (
    <Panel
      className={`Layer__${COMPONENT_NAME}`}
      sidebar={<JournalSidebar parentRef={containerRef} />}
      sidebarIsOpen={Boolean(selectedEntryId && selectedEntryId !== 'new')}
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
            <Heading
              className={`Layer__${COMPONENT_NAME}__title`}
              size={HeadingSize.view}
            >
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
            <JournalEntriesDownloadButton
              iconOnly={['mobile', 'tablet'].includes(view)}
            />
            <Button
              onClick={() => toCreateEntry()}
              iconOnly={view === 'mobile'}
              leftIcon={view === 'mobile' && <PlusIcon size={14} />}
            >
              {stringOverrides?.addEntryButton || 'Add Entry'}
            </Button>
          </HeaderCol>
        </HeaderRow>
      </Header>

      {data && <JournalTable view={view} data={data} stringOverrides={stringOverrides} />}

      {data && (
        <Pagination
          currentPage={currentPage}
          totalCount={rawData?.length || 0}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          hasMore={hasMore}
          fetchMore={fetchMore}
        />
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

      {error
        ? (
          <div className='Layer__table-state-container'>
            <DataState
              status={DataStateStatus.failed}
              title='Something went wrong'
              description='We couldn’t load your data.'
              onRefresh={() => { void refetch() }}
              isLoading={isValidating || isLoading}
            />
          </div>
        )
        : null}

      {(!data || isLoading) && !error
        ? (
          <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
            <Loader />
          </div>
        )
        : null}
    </Panel>
  )
}
