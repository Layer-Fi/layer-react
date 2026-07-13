import { useTranslation } from 'react-i18next'

import { type LedgerEntrySourceType } from '@schemas/generalLedger/ledgerEntrySource'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { DateTime } from '@components/DateTime/DateTime'
import { EntryDetailField } from '@components/LedgerEntryDetails/EntryDetailSection'
import { type SourceDetailStringOverrides } from '@components/LedgerEntryDetails/types'

export const SourceDetailView = ({
  source,
  stringOverrides,
}: {
  source: LedgerEntrySourceType
  stringOverrides?: SourceDetailStringOverrides
}) => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  switch (source.type) {
    case 'Transaction_Ledger_Entry_Source': {
      return (
        <>
          <EntryDetailField
            label={stringOverrides?.accountNameLabel || t('generalLedger:label.account_name', 'Account name')}
          >
            {source.accountName}
          </EntryDetailField>
          <EntryDetailField label={stringOverrides?.dateLabel || t('common:label.date', 'Date')}>
            <DateTime value={source.date} />
          </EntryDetailField>
          <EntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.amount)}
          </EntryDetailField>
          <EntryDetailField
            label={stringOverrides?.directionLabel || t('common:label.direction', 'Direction')}
          >
            {source.direction}
          </EntryDetailField>
          <EntryDetailField
            label={stringOverrides?.counterpartyLabel || t('common:label.counterparty', 'Counterparty')}
          >
            {source.counterparty || source.displayDescription}
          </EntryDetailField>
        </>
      )
    }
    case 'Invoice_Ledger_Entry_Source': {
      return (
        <>
          <EntryDetailField
            label={stringOverrides?.invoiceNumberLabel || t('generalLedger:label.invoice_number', 'Invoice number')}
          >
            {source.invoiceNumber}
          </EntryDetailField>
          <EntryDetailField
            label={stringOverrides?.recipientNameLabel || t('generalLedger:label.recipient_name', 'Recipient name')}
          >
            {source.recipientName}
          </EntryDetailField>
          <EntryDetailField label={stringOverrides?.dateLabel || t('common:label.date', 'Date')}>
            <DateTime value={source.date} />
          </EntryDetailField>
          <EntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.amount)}
          </EntryDetailField>
        </>
      )
    }
    case 'Manual_Ledger_Entry_Source': {
      return (
        <>
          <EntryDetailField label={stringOverrides?.memoLabel || t('common:label.memo', 'Memo')} fullWidth>
            {source.memo}
          </EntryDetailField>
          <EntryDetailField
            label={stringOverrides?.createdByLabel || t('common:label.created_by', 'Created by')}
          >
            {source.createdBy}
          </EntryDetailField>
        </>
      )
    }
    case 'Invoice_Payment_Ledger_Entry_Source': {
      return (
        <>
          <EntryDetailField
            label={stringOverrides?.invoiceNumberLabel || t('generalLedger:label.invoice_number', 'Invoice number')}
          >
            {source.invoiceNumber}
          </EntryDetailField>
          <EntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.amount)}
          </EntryDetailField>
        </>
      )
    }
    case 'Refund_Allocation_Ledger_Entry_Source': {
      return (
        <>
          <EntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.amount)}
          </EntryDetailField>
          <EntryDetailField
            label={stringOverrides?.recipientNameLabel || t('generalLedger:label.recipient_name', 'Recipient name')}
          >
            {source.recipientName}
          </EntryDetailField>
        </>
      )
    }
    case 'Refund_Payment_Ledger_Entry_Source': {
      return (
        <>
          <EntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.refundedToCustomerAmount)}
          </EntryDetailField>
          <EntryDetailField
            label={stringOverrides?.recipientNameLabel || t('generalLedger:label.recipient_name', 'Recipient name')}
          >
            {source.recipientName}
          </EntryDetailField>
        </>
      )
    }
    case 'Opening_Balance_Ledger_Entry_Source': {
      return (
        <EntryDetailField
          label={stringOverrides?.accountNameLabel || t('generalLedger:label.account_name', 'Account name')}
        >
          {source.accountName}
        </EntryDetailField>
      )
    }
    case 'Payout_Ledger_Entry_Source': {
      return (
        <>
          <EntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.paidOutAmount)}
          </EntryDetailField>
          <EntryDetailField
            label={stringOverrides?.processorLabel || t('common:label.processor', 'Processor')}
          >
            {source.processor}
          </EntryDetailField>
        </>
      )
    }

    case 'Quickbooks_Ledger_Entry_Source': {
      return (
        <>
          <EntryDetailField label={t('generalLedger:label.quickbooks_id', 'QuickBooks ID')}>
            {source.quickbooksId}
          </EntryDetailField>
          <EntryDetailField label={t('generalLedger:label.import_date', 'Import Date')}>
            <DateTime value={source.importDate} />
          </EntryDetailField>
        </>
      )
    }
    case 'Invoice_Write_Off_Ledger_Entry_Source': {
      return (
        <>
          <EntryDetailField
            label={stringOverrides?.invoiceNumberLabel || t('generalLedger:label.invoice_number', 'Invoice number')}
          >
            {source.invoiceNumber}
          </EntryDetailField>
          <EntryDetailField
            label={stringOverrides?.recipientNameLabel || t('generalLedger:label.recipient_name', 'Recipient name')}
          >
            {source.recipientName}
          </EntryDetailField>
          <EntryDetailField label={t('invoices:label.write_off_date', 'Write-off Date')}>
            <DateTime value={source.date} />
          </EntryDetailField>
          <EntryDetailField label={t('invoices:label.write_off_amount', 'Write-off Amount')}>
            {formatCurrencyFromCents(source.writeOffAmount)}
          </EntryDetailField>
        </>
      )
    }
    case 'Vendor_Refund_Allocation_Ledger_Entry_Source': {
      return (
        <>
          <EntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.amount)}
          </EntryDetailField>
          <EntryDetailField label={t('customerVendor:label.vendor_description', 'Vendor Description')}>
            {source.vendorDescription}
          </EntryDetailField>
        </>
      )
    }
    case 'Vendor_Refund_Payment_Ledger_Entry_Source': {
      return (
        <>
          <EntryDetailField label={t('invoices:label.refunded_amount', 'Refunded Amount')}>
            {formatCurrencyFromCents(source.refundedByVendorAmount)}
          </EntryDetailField>
          <EntryDetailField label={t('customerVendor:label.vendor_description', 'Vendor Description')}>
            {source.vendorDescription}
          </EntryDetailField>
        </>
      )
    }
    case 'Vendor_Payout_Ledger_Entry_Source': {
      return (
        <>
          <EntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.paidOutAmount)}
          </EntryDetailField>
          <EntryDetailField
            label={stringOverrides?.processorLabel || t('common:label.processor', 'Processor')}
          >
            {source.processor}
          </EntryDetailField>
          <EntryDetailField label={t('date:label.completed_at', 'Completed At')}>
            <DateTime value={source.completedAt} />
          </EntryDetailField>
        </>
      )
    }
    case 'Payroll_Ledger_Entry_Source': {
      return (
        <EntryDetailField label={t('generalLedger:label.payday', 'Payday')}>
          <DateTime value={source.payday} />
        </EntryDetailField>
      )
    }
    case 'Payroll_Payment_Ledger_Entry_Source': {
      return (
        <EntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
          {formatCurrencyFromCents(source.amount)}
        </EntryDetailField>
      )
    }
    case 'Bill_Ledger_Entry_Source': {
      return (
        <>
          <EntryDetailField label={t('generalLedger:label.bill_number', 'Bill Number')}>
            {source.billNumber}
          </EntryDetailField>
          <EntryDetailField label={t('customerVendor:label.vendor_description', 'Vendor Description')}>
            {source.vendorDescription}
          </EntryDetailField>
          <EntryDetailField label={stringOverrides?.dateLabel || t('common:label.date', 'Date')}>
            <DateTime value={source.date} />
          </EntryDetailField>
          <EntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.amount)}
          </EntryDetailField>
        </>
      )
    }
    case 'Bill_Payment_Ledger_Entry_Source': {
      return (
        <>
          <EntryDetailField label={t('generalLedger:label.bill_number', 'Bill Number')}>
            {source.billNumber}
          </EntryDetailField>
          <EntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.amount)}
          </EntryDetailField>
        </>
      )
    }
    case 'Vendor_Credit_Ledger_Entry_Source': {
      const vendorDisplayName = source.vendor.individualName ?? source.vendor.companyName
      return (
        <>
          <EntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.amount)}
          </EntryDetailField>
          {vendorDisplayName && (
            <EntryDetailField label={t('customerVendor:label.vendor', 'Vendor')}>
              {vendorDisplayName}
            </EntryDetailField>
          )}
        </>
      )
    }
    case 'Customer_Credit_Ledger_Entry_Source': {
      const customerDisplayName = source.customer.individualName ?? source.customer.companyName
      return (
        <>
          <EntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.amount)}
          </EntryDetailField>
          {customerDisplayName && (
            <EntryDetailField label={t('customerVendor:label.customer', 'Customer')}>
              {customerDisplayName}
            </EntryDetailField>
          )}
        </>
      )
    }

    default:
      return null
  }
}
