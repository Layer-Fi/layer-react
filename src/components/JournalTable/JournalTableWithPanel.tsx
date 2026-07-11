import { type RefObject, useContext } from 'react'
import { CirclePlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useJournalNavigation } from '@providers/JournalStore/JournalStoreProvider'
import { useLedgerDateRange } from '@providers/LedgerDateStore/LedgerDateStoreProvider'
import { JournalContext } from '@contexts/JournalContext/JournalContext'
import { Button } from '@ui/Button/Button'
import { Heading } from '@ui/Typography/Heading'
import { LedgerDateRangeSelection } from '@components/DateSelection/LedgerDateRangeSelection'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { JournalEntriesDownloadButton } from '@components/Journal/download/JournalEntriesDownloadButton'
import { JournalSidebar } from '@components/JournalSidebar/JournalSidebar'
import { JournalTable } from '@components/JournalTable/JournalTable'
import { Panel } from '@components/Panel/Panel'

const COMPONENT_NAME = 'journal-table'

export interface JournalTableStringOverrides {
  componentTitle?: string
  /** @deprecated The sub-header row was removed; this override no longer renders. */
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
  stringOverrides,
}: {
  containerRef: RefObject<HTMLDivElement>
  stringOverrides?: JournalTableStringOverrides
}) => {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()
  const { toCreateEntry } = useJournalNavigation()
  const { startDate, endDate } = useLedgerDateRange({ dateSelectionMode: 'full' })
  const addEntryLabel = stringOverrides?.addEntryButton || t('generalLedger:action.add_entry', 'Add Entry')

  const { selectedEntryId } = useContext(JournalContext)

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
            <Heading level={2} size='md'>
              {stringOverrides?.componentTitle || t('generalLedger:label.journal', 'Journal')}
            </Heading>
          </HeaderCol>
          <HeaderCol>
            <JournalEntriesDownloadButton
              startDate={startDate}
              endDate={endDate}
              icon={!isDesktop}
            />
            <Button
              onPress={() => toCreateEntry()}
              icon={!isDesktop}
              aria-label={!isDesktop ? addEntryLabel : undefined}
            >
              {isDesktop ? addEntryLabel : <CirclePlus size={14} />}
            </Button>
          </HeaderCol>
        </HeaderRow>
        <HeaderRow>
          <HeaderCol>
            <LedgerDateRangeSelection />
          </HeaderCol>
        </HeaderRow>
      </Header>

      <JournalTable stringOverrides={stringOverrides} />
    </Panel>
  )
}
