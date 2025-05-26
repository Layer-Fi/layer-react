import { BillsProvider, useBillsContext } from '../../contexts/BillsContext'
import { useElementViewSize } from '../../hooks/useElementViewSize/useElementViewSize'
import { BillsDetails } from './BillsDetails'
import { BillsTableStringOverrides, BillsTableWithPanel } from './BillsTableWithPanel'
import { Container } from '../Container'

export type BillsStringOverrides = {
  billsTable?: BillsTableStringOverrides
  paidToggleOption?: string
  unpaidToggleOption?: string
}

export type BillsProps = {
  context?: boolean
  asWidget?: boolean
  stringOverrides?: BillsStringOverrides
}

export const Bills = ({ context = true, ...props }: BillsProps) => {
  if (context) {
    return (
      <BillsProvider>
        <BillsContent {...props} />
      </BillsProvider>
    )
  }

  return <BillsContent {...props} />
}

const BillsContent = ({
  asWidget,
  stringOverrides,
}: BillsProps) => {
  const { showBillInDetails, billInDetails } = useBillsContext()

  const { containerRef } = useElementViewSize<HTMLDivElement>()

  return (
    <Container
      name='bills'
      ref={containerRef}
      asWidget={asWidget}
    >
      {showBillInDetails
        ? (
          <BillsDetails containerRef={containerRef} bill={billInDetails} />
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
