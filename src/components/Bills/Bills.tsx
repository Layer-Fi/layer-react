import React, { useContext } from 'react'
import { BillsContext, BillsProvider } from '../../contexts/BillsContext'
import { useElementViewSize } from '../../hooks/useElementViewSize/useElementViewSize'
import { BillsDetails } from './BillsDetails'
import { BillsTableStringOverrides, BillsTableWithPanel } from './BillsTableWithPanel'
import { Container } from '../Container'

export type BillsStringOverrides = {
  billsTable?: BillsTableStringOverrides
  paidToggleOption?: string
  unpaidToggleOption?: string
}

export type BillsTab = 'paid' | 'unpaid'

export type BillsProps = {
  asWidget?: boolean
  stringOverrides?: BillsStringOverrides
  activeTab: BillsTab
  setActiveTab: (tab: BillsTab) => void
}

export const Bills = (props: BillsProps) => (
  <BillsProvider>
    <BillsContent
      activeTab={props.activeTab}
      setActiveTab={props.setActiveTab}
    />
  </BillsProvider>
)

const BillsContent = ({
  asWidget,
  stringOverrides,
  activeTab,
  setActiveTab,
}: BillsProps) => {
  const { billDetailsId } = useContext(BillsContext)

  const { view, containerRef } = useElementViewSize<HTMLDivElement>()

  return (
    <Container
      name='bills'
      ref={containerRef}
      asWidget={asWidget}
      transparentBg
    >
      {billDetailsId
        ? (
          <BillsDetails billDetailsId={billDetailsId} />
        )
        : (
          <BillsTableWithPanel
            containerRef={containerRef}
            view={view}
            stringOverrides={stringOverrides?.billsTable}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
    </Container>
  )
}
