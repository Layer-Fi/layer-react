import { Plus } from 'lucide-react'

import { useInvoiceDetail } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { VStack } from '@ui/Stack/Stack'
import { EMPTY_LINE_ITEM } from '@components/Invoices/InvoiceForm/formUtils'
import { InvoiceFormLineItemRow } from '@components/Invoices/InvoiceForm/InvoiceFormLineItemRow/InvoiceFormLineItemRow'
import type { InvoiceFormType } from '@components/Invoices/InvoiceForm/useInvoiceForm'

import './invoiceFormLineItemsSection.scss'

type InvoiceFormLineItemsSectionProps = {
  form: InvoiceFormType
}

export const InvoiceFormLineItemsSection = ({
  form,
}: InvoiceFormLineItemsSectionProps) => {
  const { isReadOnly } = useInvoiceDetail()

  return (
    <form.Field name='lineItems' mode='array'>
      {field => (
        <VStack gap='xs' align='baseline'>
          {field.state.value.map((_lineItem, index) => (
            <InvoiceFormLineItemRow
              key={index}
              form={form}
              index={index}
              isReadOnly={isReadOnly}
              onDeleteLine={() => field.removeValue(index)}
            />
          ))}
          {!isReadOnly
            && (
              <Button variant='outlined' onClick={() => field.pushValue(EMPTY_LINE_ITEM)}>
                Add line item
                <Plus size={16} />
              </Button>
            )}
        </VStack>
      )}
    </form.Field>
  )
}
