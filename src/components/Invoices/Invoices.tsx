import { useCallback, useState } from 'react'
import { View } from '../../components/View'
import { InvoiceDetail } from './InvoiceDetail/InvoiceDetail'
import { InvoicesTable } from './InvoicesTable/InvoicesTable'
import type { InvoiceFormMode } from './InvoiceForm/InvoiceForm'
import type { Invoice } from '../../features/invoices/invoiceSchemas'
import { UpsertInvoiceMode } from '../../features/invoices/api/useUpsertInvoice'

interface InvoicesStringOverrides {
  title?: string
}

export interface InvoicesProps {
  showTitle?: boolean
  stringOverrides?: InvoicesStringOverrides
}

export const Invoices = ({
  showTitle = true,
  stringOverrides,
}: InvoicesProps) => {
  const [invoiceFormMode, setInvoiceFormMode] = useState<InvoiceFormMode | null>(null)

  const goBackToInvoicesTable = useCallback(() => {
    setInvoiceFormMode(null)
  }, [])

  const onCreateInvoice = useCallback(() => {
    setInvoiceFormMode({ mode: UpsertInvoiceMode.Create })
  }, [])

  const onSelectInvoice = useCallback((invoice: Invoice) => {
    setInvoiceFormMode({ mode: UpsertInvoiceMode.Update, invoice })
  }, [])

  return (
    <View
      title={stringOverrides?.title || 'Invoices'}
      showHeader={showTitle}
    >
      {invoiceFormMode !== null
        ? <InvoiceDetail {...invoiceFormMode} onGoBack={goBackToInvoicesTable} />
        : <InvoicesTable onCreateInvoice={onCreateInvoice} onSelectInvoice={onSelectInvoice} />}
    </View>
  )
}
