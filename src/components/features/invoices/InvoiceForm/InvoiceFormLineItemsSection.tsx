import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useInvoiceDetail } from '@providers/features/invoices/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { VStack } from '@ui/Stack/Stack'
import { EMPTY_LINE_ITEM } from '@features/invoices/InvoiceForm/formUtils'
import { InvoiceFormLineItemRow } from '@features/invoices/InvoiceForm/InvoiceFormLineItemRow'
import type { InvoiceFormType } from '@features/invoices/InvoiceForm/useInvoiceForm'

import './invoiceFormLineItemsSection.scss'

type InvoiceFormLineItemsSectionProps = {
  form: InvoiceFormType
}

export const InvoiceFormLineItemsSection = ({
  form,
}: InvoiceFormLineItemsSectionProps) => {
  const { t } = useTranslation()
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
                {t('invoices:InvoiceForm.action.add_line_item', 'Add line item')}
                <Plus size={16} />
              </Button>
            )}
        </VStack>
      )}
    </form.Field>
  )
}
