import React, { useContext, useState } from 'react'
import { BillsContext } from '../../contexts/BillsContext'
import { useBills } from '../../hooks/useBills'
import { useElementViewSize } from '../../hooks/useElementViewSize'
import { View } from '../../types/general'
import { BillsDetails } from '../BillsDetails'
import { BillsTable } from '../BillsTable'
import { BillsTableStringOverrides } from '../BillsTable/BillsTableWithPanel'
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
  const [view, setView] = useState<View>('desktop')
  const { billDetailsId } = useContext(BillsContext)

  const containerRef = useElementViewSize<HTMLDivElement>(newView =>
    setView(newView),
  )

  return (
    <Container
      name='bills'
      ref={containerRef}
      asWidget={asWidget}
      transparentBg
    >
      {billDetailsId ? (
        <BillsDetails billDetailsId={billDetailsId} />
      ) : (
        <BillsTable
          view={view}
          containerRef={containerRef}
          stringOverrides={stringOverrides?.billsTable}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </Container>
  )
}
