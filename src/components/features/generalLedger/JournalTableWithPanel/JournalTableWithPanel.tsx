import { useContext } from 'react'
import { CirclePlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useBookkeepingStatusContext } from '@providers/features/bookkeeping/BookkeepingStatusContext/BookkeepingStatusContext'
import { JournalContext } from '@providers/features/generalLedger/JournalContext/JournalContext'
import { useJournalNavigation } from '@providers/features/generalLedger/JournalStore/JournalStoreProvider'
import { Button } from '@ui/Button/Button'
import { LedgerDateRangeSelection } from '@blocks/DatePickers/DateSelection/LedgerDateRangeSelection'
import { Panel } from '@blocks/Layout/View/Panel/Panel'
import { ViewHeader } from '@blocks/Layout/View/ViewHeader/ViewHeader'
import { JournalEntriesDownloadButton } from '@features/generalLedger/JournalEntriesDownloadButton/JournalEntriesDownloadButton'
import { JournalSidebar } from '@features/generalLedger/JournalSidebar/JournalSidebar'
import { JournalTable } from '@features/generalLedger/JournalTable/JournalTable'

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
  stringOverrides,
}: {
  stringOverrides?: JournalTableStringOverrides
}) => {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()
  const { toCreateEntry } = useJournalNavigation()
  const { isActiveBookkeepingStatus } = useBookkeepingStatusContext()
  const showAddEntryButton = !isActiveBookkeepingStatus
  const addEntryLabel = stringOverrides?.addEntryButton || t('generalLedger:JournalTableWithPanel.action.add_entry', 'Add Entry')

  const { selectedEntryId } = useContext(JournalContext)

  return (
    <Panel
      className={`Layer__${COMPONENT_NAME}`}
      sidebar={<JournalSidebar />}
      sidebarIsOpen={Boolean(selectedEntryId && selectedEntryId !== 'new')}
    >
      <ViewHeader
        surface='panel'
        className={`Layer__${COMPONENT_NAME}__header`}
        asHeader
        sticky
        rounded
        title={stringOverrides?.componentTitle || t('generalLedger:JournalTableWithPanel.label.journal', 'Journal')}
        slots={{
          Actions: (
            <>
              <JournalEntriesDownloadButton
                filterByDateRange
                icon={!isDesktop}
              />
              {showAddEntryButton && (
                <Button
                  onPress={() => toCreateEntry()}
                  icon={!isDesktop}
                  aria-label={!isDesktop ? addEntryLabel : undefined}
                >
                  {isDesktop ? addEntryLabel : <CirclePlus size={14} />}
                </Button>
              )}
            </>
          ),
          Filters: <LedgerDateRangeSelection />,
        }}
      />

      <JournalTable stringOverrides={stringOverrides} />
    </Panel>
  )
}
