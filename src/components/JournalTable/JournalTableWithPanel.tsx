import { type RefObject, useContext } from 'react'
import { CirclePlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type View } from '@internal-types/general'
import { useReportsCompactHeader } from '@hooks/features/reports/useReportsCompactHeader'
import { useJournalNavigation } from '@providers/JournalStore/JournalStoreProvider'
import { JournalContext } from '@contexts/JournalContext/JournalContext'
import { Button } from '@ui/Button/Button'
import { Heading } from '@ui/Typography/Heading'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { GlobalDateRangeSelection } from '@components/DateSelection/GlobalDateRangeSelection'
import { JournalEntriesDownloadButton } from '@components/Journal/download/JournalEntriesDownloadButton'
import { JournalSidebar } from '@components/JournalSidebar/JournalSidebar'
import { JournalTable } from '@components/JournalTable/JournalTable'
import { Panel } from '@components/Panel/Panel'

import './journalTableWithPanel.scss'

export interface JournalTableStringOverrides {
  componentTitle?: string
  /** @deprecated No longer used. */
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
  view,
}: {
  view: View
  containerRef: RefObject<HTMLDivElement>
  stringOverrides?: JournalTableStringOverrides
}) => {
  const { t } = useTranslation()
  const { toCreateEntry } = useJournalNavigation()
  const { headerRef, isCompact } = useReportsCompactHeader()
  const addEntryLabel = stringOverrides?.addEntryButton || t('generalLedger:action.add_entry', 'Add Entry')

  const { selectedEntryId } = useContext(JournalContext)

  return (
    <Panel
      className={`Layer__JournalTableWithPanel`}
      sidebar={<JournalSidebar parentRef={containerRef} />}
      sidebarIsOpen={Boolean(selectedEntryId && selectedEntryId !== 'new')}
      parentRef={containerRef}
    >
      <Header
        ref={headerRef}
        className={`Layer__JournalTableWithPanel__Header`}
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
              icon={['mobile', 'tablet'].includes(view)}
            />
            <Button
              onPress={() => toCreateEntry()}
              icon={view === 'mobile'}
              aria-label={view === 'mobile' ? addEntryLabel : undefined}
            >
              {view === 'mobile' ? <CirclePlus size={14} /> : addEntryLabel}
            </Button>
          </HeaderCol>
        </HeaderRow>
        <HeaderRow className='Layer__JournalTableWithPanel__FiltersRow'>
          <HeaderCol className='Layer__JournalTableWithPanel__FiltersCol'>
            <GlobalDateRangeSelection showLabels={true} isCompact={isCompact} />
          </HeaderCol>
        </HeaderRow>
      </Header>
      <JournalTable stringOverrides={stringOverrides} />
    </Panel>
  )
}
