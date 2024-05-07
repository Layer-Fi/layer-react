import React, {
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import DownloadCloud from '../../icons/DownloadCloud'
import { Button, ButtonVariant } from '../Button'
import { Header } from '../Container'
import { DataState, DataStateStatus } from '../DataState'
import { JournalContext, View } from '../Journal'
import { JournalRow } from '../JournalRow'
import { JournalSidebar } from '../JournalSidebar'
import { Loader } from '../Loader'
import { Pagination } from '../Pagination'
import { Panel } from '../Panel'
import { Heading } from '../Typography'

const COMPONENT_NAME = 'journal'

export const JournalTable = ({
  view,
  containerRef,
  pageSize = 15,
}: {
  view: View
  containerRef: RefObject<HTMLDivElement>
  pageSize?: number
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [initialLoad, setInitialLoad] = useState(true)
  const {
    data: rawData,
    isLoading,
    error,
    isValidating,
    refetch,
    selectedEntryId,
    setSelectedEntryId,
  } = useContext(JournalContext)

  useEffect(() => {
    if (!isLoading) {
      const timeoutLoad = setTimeout(() => {
        setInitialLoad(false)
      }, 1000)
      return () => clearTimeout(timeoutLoad)
    }
  }, [isLoading])

  const data = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize
    const lastPageIndex = firstPageIndex + pageSize
    return rawData
      ?.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      ?.slice(firstPageIndex, lastPageIndex)
  }, [rawData, currentPage])

  return (
    <Panel
      sidebar={<JournalSidebar parentRef={containerRef} />}
      sidebarIsOpen={Boolean(selectedEntryId)}
      parentRef={containerRef}
    >
      <Header className={`Layer__${COMPONENT_NAME}__header`}>
        <Heading className={`Layer__${COMPONENT_NAME}__title`}>Journal</Heading>
        <div className={`Layer__${COMPONENT_NAME}__actions`}>
          <Button
            variant={ButtonVariant.secondary}
            disabled={isLoading}
            rightIcon={<DownloadCloud size={12} />}
          >
            Download
          </Button>
          <Button
            onClick={() => setSelectedEntryId('new')}
            disabled={isLoading}
          >
            Add Entry
          </Button>
        </div>
      </Header>

      <table className='Layer__table Layer__table--hover-effect Layer__journal__table'>
        <thead>
          <tr>
            <th className='Layer__table-header' />
            <th className='Layer__table-header'>Id</th>
            <th className='Layer__table-header'>Date</th>
            <th className='Layer__table-header'>Transaction</th>
            <th className='Layer__table-header'>Account</th>
            <th className='Layer__table-header Layer__table-cell--amount'>
              Debit
            </th>
            <th className='Layer__table-header Layer__table-cell--amount'>
              Credit
            </th>
          </tr>
        </thead>

        <tbody>
          {!error &&
            data?.map((entry, idx) => {
              return (
                <JournalRow
                  key={entry.id}
                  index={idx}
                  view={view}
                  row={entry}
                />
              )
            })}
        </tbody>
      </table>

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
