import React, { useContext } from 'react'
import { BillsProvider, useBillsContext } from '../../contexts/BillsContext'
import { useElementViewSize } from '../../hooks/useElementViewSize/useElementViewSize'
import { BillsDetails } from './BillsDetails'
import { BillsTableStringOverrides, BillsTableWithPanel } from './BillsTableWithPanel'
import { Container } from '../Container'
import { useBills } from '../../hooks/useBills'

export type BillsStringOverrides = {
  billsTable?: BillsTableStringOverrides
  paidToggleOption?: string
  unpaidToggleOption?: string
}

export type BillsProps = {
  asWidget?: boolean
  stringOverrides?: BillsStringOverrides
}

export const Bills = (props: BillsProps) => (
  <BillsProvider>
    <BillsContent {...props} />
  </BillsProvider>
)

const BillsContent = ({
  asWidget,
  stringOverrides,
}: BillsProps) => {
  const { billInDetails } = useBillsContext()

  const { containerRef } = useElementViewSize<HTMLDivElement>()

  return (
    <Container
      name='bills'
      ref={containerRef}
      asWidget={asWidget}
      transparentBg
    >
      {billInDetails
        ? (
          <BillsDetails bill={billInDetails} />
        )
        : (
          <BillsTableWithPanel
            containerRef={containerRef}
            stringOverrides={stringOverrides?.billsTable}
          />
        )}
    </Container>
  )
}
