import React, { useContext } from 'react'
import { BillsContext } from '../../contexts/BillsContext'
import { useBills } from '../../hooks/useBills'
import { useElementViewSize } from '../../hooks/useElementViewSize/useElementViewSize'
import { BillsDetails } from './BillsDetails'
import { BillsTable } from './BillsTable'
import { BillsTableStringOverrides, BillsTableWithPanel } from './BillsTableWithPanel'
import { Container } from '../Container'

export interface BillsStringOverrides {
  billsTable?: BillsTableStringOverrides
  paidToggleOption?: string
  unpaidToggleOption?: string
}

export interface BillsProps {
  asWidget?: boolean
  stringOverrides?: BillsStringOverrides
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const Bills = (props: BillsProps) => {
  const BillsContextData = useBills()
  return (
    <BillsContext.Provider value={BillsContextData}>
      <BillsContent
        activeTab={props.activeTab}
        setActiveTab={props.setActiveTab}
      />
    </BillsContext.Provider>
  )
}

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
