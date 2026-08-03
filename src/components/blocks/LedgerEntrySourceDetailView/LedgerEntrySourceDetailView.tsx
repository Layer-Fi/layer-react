import { useTranslation } from 'react-i18next'

import { BankTransactionDirection } from '@schemas/bankTransactions/base'
import { type LedgerEntrySourceType } from '@schemas/generalLedger/ledgerEntrySource'
import { humanizeEnum } from '@utils/format'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { DateTime } from '@ui/DateTime/DateTime'
import { LedgerEntryDetailField } from '@blocks/LedgerEntryDetailField/LedgerEntryDetailField'

export interface LedgerEntrySourceDetailStringOverrides {
  sourceLabel?: string
  accountNameLabel?: string
  dateLabel?: string
  amountLabel?: string
  directionLabel?: string
  counterpartyLabel?: string
  invoiceNumberLabel?: string
  recipientNameLabel?: string
  memoLabel?: string
  createdByLabel?: string
  processorLabel?: string
}

export const LedgerEntrySourceDetailView = ({
  source,
  stringOverrides,
}: {
  source: LedgerEntrySourceType
  stringOverrides?: LedgerEntrySourceDetailStringOverrides
}) => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  switch (source.type) {
    case 'Transaction_Ledger_Entry_Source': {
      return (
        <>
          <LedgerEntryDetailField
            label={stringOverrides?.accountNameLabel || t('generalLedger:label.account_name', 'Account name')}
          >
            {source.accountName}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField label={stringOverrides?.dateLabel || t('common:label.date', 'Date')}>
            <DateTime value={source.date} />
          </LedgerEntryDetailField>
          <LedgerEntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.amount)}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField
            label={stringOverrides?.directionLabel || t('common:label.direction', 'Direction')}
          >
            {source.direction === BankTransactionDirection.Credit
              ? t('common:label.money_in', 'Money in')
              : t('common:label.money_out', 'Money out')}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField
            label={stringOverrides?.counterpartyLabel || t('common:label.counterparty', 'Counterparty')}
          >
            {source.counterparty || source.displayDescription}
          </LedgerEntryDetailField>
        </>
      )
    }
    case 'Invoice_Ledger_Entry_Source': {
      return (
        <>
          <LedgerEntryDetailField
            label={stringOverrides?.invoiceNumberLabel || t('generalLedger:label.invoice_number', 'Invoice number')}
          >
            {source.invoiceNumber}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField
            label={stringOverrides?.recipientNameLabel || t('generalLedger:label.recipient_name', 'Recipient name')}
          >
            {source.recipientName}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField label={stringOverrides?.dateLabel || t('common:label.date', 'Date')}>
            <DateTime value={source.date} />
          </LedgerEntryDetailField>
          <LedgerEntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.amount)}
          </LedgerEntryDetailField>
        </>
      )
    }
    case 'Manual_Ledger_Entry_Source': {
      return (
        <>
          <LedgerEntryDetailField label={stringOverrides?.memoLabel || t('common:label.memo', 'Memo')} fullWidth>
            {source.memo}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField
            label={stringOverrides?.createdByLabel || t('common:label.created_by', 'Created by')}
          >
            {source.createdBy}
          </LedgerEntryDetailField>
        </>
      )
    }
    case 'Invoice_Payment_Ledger_Entry_Source': {
      return (
        <>
          <LedgerEntryDetailField
            label={stringOverrides?.invoiceNumberLabel || t('generalLedger:label.invoice_number', 'Invoice number')}
          >
            {source.invoiceNumber}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.amount)}
          </LedgerEntryDetailField>
        </>
      )
    }
    case 'Refund_Allocation_Ledger_Entry_Source': {
      return (
        <>
          <LedgerEntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.amount)}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField
            label={stringOverrides?.recipientNameLabel || t('generalLedger:label.recipient_name', 'Recipient name')}
          >
            {source.recipientName}
          </LedgerEntryDetailField>
        </>
      )
    }
    case 'Refund_Payment_Ledger_Entry_Source': {
      return (
        <>
          <LedgerEntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.refundedToCustomerAmount)}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField
            label={stringOverrides?.recipientNameLabel || t('generalLedger:label.recipient_name', 'Recipient name')}
          >
            {source.recipientName}
          </LedgerEntryDetailField>
        </>
      )
    }
    case 'Opening_Balance_Ledger_Entry_Source': {
      return (
        <LedgerEntryDetailField
          label={stringOverrides?.accountNameLabel || t('generalLedger:label.account_name', 'Account name')}
        >
          {source.accountName}
        </LedgerEntryDetailField>
      )
    }
    case 'Payout_Ledger_Entry_Source': {
      return (
        <>
          <LedgerEntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.paidOutAmount)}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField
            label={stringOverrides?.processorLabel || t('common:label.processor', 'Processor')}
          >
            {source.processor}
          </LedgerEntryDetailField>
        </>
      )
    }

    case 'Quickbooks_Ledger_Entry_Source': {
      return (
        <>
          <LedgerEntryDetailField label={t('generalLedger:label.quickbooks_id', 'QuickBooks ID')}>
            {source.quickbooksId}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField label={t('generalLedger:label.import_date', 'Import Date')}>
            <DateTime value={source.importDate} />
          </LedgerEntryDetailField>
        </>
      )
    }
    case 'Invoice_Write_Off_Ledger_Entry_Source': {
      return (
        <>
          <LedgerEntryDetailField
            label={stringOverrides?.invoiceNumberLabel || t('generalLedger:label.invoice_number', 'Invoice number')}
          >
            {source.invoiceNumber}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField
            label={stringOverrides?.recipientNameLabel || t('generalLedger:label.recipient_name', 'Recipient name')}
          >
            {source.recipientName}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField label={t('invoices:label.write_off_date', 'Write-off Date')}>
            <DateTime value={source.date} />
          </LedgerEntryDetailField>
          <LedgerEntryDetailField label={t('invoices:label.write_off_amount', 'Write-off Amount')}>
            {formatCurrencyFromCents(source.writeOffAmount)}
          </LedgerEntryDetailField>
        </>
      )
    }
    case 'Vendor_Refund_Allocation_Ledger_Entry_Source': {
      return (
        <>
          <LedgerEntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.amount)}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField label={t('customerVendor:label.vendor_description', 'Vendor Description')}>
            {source.vendorDescription}
          </LedgerEntryDetailField>
        </>
      )
    }
    case 'Vendor_Refund_Payment_Ledger_Entry_Source': {
      return (
        <>
          <LedgerEntryDetailField label={t('invoices:label.refunded_amount', 'Refunded Amount')}>
            {formatCurrencyFromCents(source.refundedByVendorAmount)}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField label={t('customerVendor:label.vendor_description', 'Vendor Description')}>
            {source.vendorDescription}
          </LedgerEntryDetailField>
        </>
      )
    }
    case 'Vendor_Payout_Ledger_Entry_Source': {
      return (
        <>
          <LedgerEntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.paidOutAmount)}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField
            label={stringOverrides?.processorLabel || t('common:label.processor', 'Processor')}
          >
            {source.processor}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField label={t('date:label.completed_at', 'Completed At')}>
            <DateTime value={source.completedAt} />
          </LedgerEntryDetailField>
        </>
      )
    }
    case 'Payroll_Ledger_Entry_Source': {
      return (
        <LedgerEntryDetailField label={t('generalLedger:label.payday', 'Payday')}>
          <DateTime value={source.payday} />
        </LedgerEntryDetailField>
      )
    }
    case 'Payroll_Payment_Ledger_Entry_Source': {
      return (
        <LedgerEntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
          {formatCurrencyFromCents(source.amount)}
        </LedgerEntryDetailField>
      )
    }
    case 'Bill_Ledger_Entry_Source': {
      return (
        <>
          <LedgerEntryDetailField label={t('generalLedger:label.bill_number', 'Bill Number')}>
            {source.billNumber}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField label={t('customerVendor:label.vendor_description', 'Vendor Description')}>
            {source.vendorDescription}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField label={stringOverrides?.dateLabel || t('common:label.date', 'Date')}>
            <DateTime value={source.date} />
          </LedgerEntryDetailField>
          <LedgerEntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.amount)}
          </LedgerEntryDetailField>
        </>
      )
    }
    case 'Bill_Payment_Ledger_Entry_Source': {
      return (
        <>
          <LedgerEntryDetailField label={t('generalLedger:label.bill_number', 'Bill Number')}>
            {source.billNumber}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.amount)}
          </LedgerEntryDetailField>
        </>
      )
    }
    case 'Vendor_Credit_Ledger_Entry_Source': {
      const vendorDisplayName = source.vendor.individualName ?? source.vendor.companyName
      return (
        <>
          <LedgerEntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.amount)}
          </LedgerEntryDetailField>
          {vendorDisplayName && (
            <LedgerEntryDetailField label={t('customerVendor:label.vendor', 'Vendor')}>
              {vendorDisplayName}
            </LedgerEntryDetailField>
          )}
        </>
      )
    }
    case 'Customer_Credit_Ledger_Entry_Source': {
      const customerDisplayName = source.customer.individualName ?? source.customer.companyName
      return (
        <>
          <LedgerEntryDetailField label={stringOverrides?.amountLabel || t('common:label.amount', 'Amount')}>
            {formatCurrencyFromCents(source.amount)}
          </LedgerEntryDetailField>
          {customerDisplayName && (
            <LedgerEntryDetailField label={t('customerVendor:label.customer', 'Customer')}>
              {customerDisplayName}
            </LedgerEntryDetailField>
          )}
        </>
      )
    }

    case 'Closing_Action_Ledger_Entry_Source': {
      return (
        <>
          <LedgerEntryDetailField label={t('generalLedger:label.closing_action_type', 'Action type')}>
            {humanizeEnum(source.actionType)}
          </LedgerEntryDetailField>
          <LedgerEntryDetailField label={t('generalLedger:label.closing_date', 'Closing date')}>
            <DateTime value={source.closingDate} onlyDate />
          </LedgerEntryDetailField>
        </>
      )
    }

    default:
      return null
  }
}
