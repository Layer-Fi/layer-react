import React, { useContext, useMemo } from 'react'
import { LedgerAccountsContext } from '../../contexts/LedgerAccountsContext'
import XIcon from '../../icons/X'
import { centsToDollars } from '../../models/Money'
import { Direction } from '../../types'
import {
  InvoiceLedgerEntrySource,
  InvoicePaymentLedgerEntrySource,
  LedgerEntrySource,
  ManualLedgerEntrySource,
  OpeningBalanceLedgerEntrySource,
  PayoutLedgerEntrySource,
  RefundPaymentLedgerEntrySource,
  TransactionLedgerEntrySource,
} from '../../types/ledger_accounts'
import { humanizeEnum } from '../../utils/format'
import { Badge, BadgeVariant } from '../Badge'
import { BackButton, Button, ButtonVariant } from '../Button'
import { Card } from '../Card'
import { DateTime } from '../DateTime'
import { DetailsList, DetailsListItem } from '../DetailsList'
import { Table } from '../Table'
import { TableBody } from '../TableBody'
import { TableCell } from '../TableCell'
import { TableHead } from '../TableHead'
import { TableRow } from '../TableRow'
import { Text, TextWeight } from '../Typography'

interface SourceDetailStringOverrides {
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

/*

    @SerialName("Transaction_Ledger_Entry_Source")
    @SerialName("Invoice_Ledger_Entry_Source")
    @SerialName("Manual_Ledger_Entry_Source")
    @SerialName("Invoice_Payment_Ledger_Entry_Source")
    @SerialName("Refund_Ledger_Entry_Source")
    @SerialName("Opening_Balance_Ledger_Entry_Source")
    @SerialName("Payout_Ledger_Entry_Source")
    */
export const SourceDetailView = ({
  source,
  stringOverrides,
}: {
  source: LedgerEntrySource
  stringOverrides?: SourceDetailStringOverrides
}) => {
  switch (source.type) {
    case 'Transaction_Ledger_Entry_Source': {
      const transactionSource = source as TransactionLedgerEntrySource
      return (
        <>
          <DetailsListItem
            label={stringOverrides?.accountNameLabel || 'Account name'}
          >
            {transactionSource.account_name}
          </DetailsListItem>
          <DetailsListItem label={stringOverrides?.dateLabel || 'Date'}>
            <DateTime value={transactionSource.date} />
          </DetailsListItem>
          <DetailsListItem label={stringOverrides?.amountLabel || 'Amount'}>
            {`$${centsToDollars(transactionSource.amount)}`}
          </DetailsListItem>
          <DetailsListItem
            label={stringOverrides?.directionLabel || 'Direction'}
          >
            {transactionSource.direction}
          </DetailsListItem>
          <DetailsListItem
            label={stringOverrides?.counterpartyLabel || 'Counterparty'}
          >
            {transactionSource.counterparty ||
              transactionSource.display_description}
          </DetailsListItem>
        </>
      )
    }
    case 'Invoice_Ledger_Entry_Source': {
      const invoiceSource = source as InvoiceLedgerEntrySource
      return (
        <>
          <DetailsListItem
            label={stringOverrides?.invoiceNumberLabel || 'Invoice number'}
          >
            {invoiceSource.invoice_number}
          </DetailsListItem>
          <DetailsListItem
            label={stringOverrides?.recipientNameLabel || 'Recipient name'}
          >
            {invoiceSource.recipient_name}
          </DetailsListItem>
          <DetailsListItem label={stringOverrides?.dateLabel || 'Date'}>
            <DateTime value={invoiceSource.date} />
          </DetailsListItem>
          <DetailsListItem label={stringOverrides?.amountLabel || 'Amount'}>
            {`$${centsToDollars(invoiceSource.amount)}`}
          </DetailsListItem>
        </>
      )
    }
    case 'Manual_Ledger_Entry_Source': {
      const manualSource = source as ManualLedgerEntrySource
      return (
        <>
          <DetailsListItem label={stringOverrides?.memoLabel || 'Memo'}>
            {manualSource.memo}
          </DetailsListItem>
          <DetailsListItem
            label={stringOverrides?.createdByLabel || 'Created by'}
          >
            {manualSource.created_by}
          </DetailsListItem>
        </>
      )
    }
    case 'Invoice_Payment_Ledger_Entry_Source': {
      const invoicePaymentSource = source as InvoicePaymentLedgerEntrySource
      return (
        <>
          <DetailsListItem
            label={stringOverrides?.invoiceNumberLabel || 'Invoice number'}
          >
            {invoicePaymentSource.invoice_number}
          </DetailsListItem>
          <DetailsListItem label={stringOverrides?.amountLabel || 'Amount'}>
            {`$${centsToDollars(invoicePaymentSource.amount)}`}
          </DetailsListItem>
        </>
      )
    }
    case 'Refund_Ledger_Entry_Source': {
      const refundSource = source as RefundPaymentLedgerEntrySource
      return (
        <>
          <DetailsListItem label={stringOverrides?.amountLabel || 'Amount'}>
            {`$${centsToDollars(refundSource.refunded_to_customer_amount)}`}
          </DetailsListItem>
          <DetailsListItem
            label={stringOverrides?.recipientNameLabel || 'Recipient name'}
          >
            {refundSource.recipient_name}
          </DetailsListItem>
        </>
      )
    }
    case 'Opening_Balance_Ledger_Entry_Source': {
      const openingBalanceSource = source as OpeningBalanceLedgerEntrySource
      return (
        <>
          <DetailsListItem
            label={stringOverrides?.accountNameLabel || 'Account name'}
          >
            {openingBalanceSource.account_name}
          </DetailsListItem>
        </>
      )
    }
    case 'Payout_Ledger_Entry_Source': {
      const payoutSource = source as PayoutLedgerEntrySource
      return (
        <>
          <DetailsListItem label={stringOverrides?.amountLabel || 'Amount'}>
            {`$${centsToDollars(payoutSource.paid_out_amount)}`}
          </DetailsListItem>
          <DetailsListItem
            label={stringOverrides?.processorLabel || 'Processor'}
          >
            {payoutSource.processor}
          </DetailsListItem>
        </>
      )
    }

    default:
      return null
  }
}

interface JournalEntryDetailsStringOverrides {
  entryTypeLabel?: string
  dateLabel?: string
  creationDateLabel?: string
  reversalLabel?: string
}

interface LineItemsTableStringOverrides {
  lineItemsColumnHeader?: string
  debitColumnHeader?: string
  creditColumnHeader?: string
  totalRowHeader?: string
}

export interface LedgerAccountEntryDetailsStringOverrides {
  title?: string
  transactionSource?: {
    header?: string
    details?: SourceDetailStringOverrides
  }
  journalEntry?: {
    header?: (entryId?: string) => string
    details?: JournalEntryDetailsStringOverrides
  }
  lineItemsTable?: LineItemsTableStringOverrides
}

export const LedgerAccountEntryDetails = ({
  stringOverrides,
}: {
  stringOverrides?: LedgerAccountEntryDetailsStringOverrides
}) => {
  const { entryData, isLoadingEntry, closeSelectedEntry, errorEntry } =
    useContext(LedgerAccountsContext)

  const { totalDebit, totalCredit } = useMemo(() => {
    let totalDebit = 0
    let totalCredit = 0
    entryData?.line_items?.forEach(item => {
      if (item.direction === Direction.CREDIT) {
        totalCredit += item.amount || 0
      } else if (item.direction === Direction.DEBIT) {
        totalDebit += item.amount || 0
      }
    })

    return { totalDebit, totalCredit }
  }, [entryData])

  return (
    <div className='Layer__ledger-account__entry-details'>
      <div className='Layer__ledger-account__entry-details__back-btn'>
        <BackButton onClick={() => closeSelectedEntry()} />
        <div className='Layer__ledger-account__entry-details__title-container'>
          <Text weight={TextWeight.bold}>
            {stringOverrides?.title || 'Transaction details'}
          </Text>
        </div>
      </div>
      <DetailsList
        title={
          stringOverrides?.transactionSource?.header || 'Transaction source'
        }
        actions={
          <Button
            rightIcon={<XIcon />}
            iconOnly={true}
            onClick={closeSelectedEntry}
            variant={ButtonVariant.secondary}
            className='Layer__details-list__close-btn'
          />
        }
      >
        <DetailsListItem
          label={
            stringOverrides?.transactionSource?.details?.sourceLabel || 'Source'
          }
          isLoading={isLoadingEntry}
        >
          <Badge>{entryData?.source?.entity_name}</Badge>
        </DetailsListItem>
        {entryData?.source?.display_description && (
          <SourceDetailView source={entryData?.source} />
        )}
      </DetailsList>

      <DetailsList
        title={
          stringOverrides?.journalEntry?.header
            ? stringOverrides?.journalEntry?.header(
                entryData?.id.substring(0, 5),
              )
            : `Journal Entry ${entryData?.id.substring(0, 5)}`
        }
        className='Layer__border-top'
      >
        <DetailsListItem
          label={
            stringOverrides?.journalEntry?.details?.entryTypeLabel ||
            'Entry type'
          }
          isLoading={isLoadingEntry}
        >
          {humanizeEnum(entryData?.entry_type ?? '')}
        </DetailsListItem>
        <DetailsListItem
          label={stringOverrides?.journalEntry?.details?.dateLabel || 'Date'}
          isLoading={isLoadingEntry}
        >
          {entryData?.entry_at && <DateTime value={entryData?.entry_at} />}
        </DetailsListItem>
        <DetailsListItem
          label={
            stringOverrides?.journalEntry?.details?.creationDateLabel ||
            'Creation date'
          }
          isLoading={isLoadingEntry}
        >
          {entryData?.date && <DateTime value={entryData?.date} />}
        </DetailsListItem>
        {entryData?.reversal_id && (
          <DetailsListItem
            label={
              stringOverrides?.journalEntry?.details?.reversalLabel ||
              'Reversal'
            }
            isLoading={isLoadingEntry}
          >
            {entryData?.reversal_id.substring(0, 5)}
          </DetailsListItem>
        )}
      </DetailsList>

      {!isLoadingEntry && !errorEntry ? (
        <div className='Layer__ledger-account__entry-details__line-items'>
          <Card>
            <Table
              componentName='ledger-account__entry-details'
              borderCollapse='collapse'
            >
              <TableHead>
                <TableRow rowKey='soc-flow-head-row' isHeadRow>
                  <TableCell>
                    {stringOverrides?.lineItemsTable?.lineItemsColumnHeader ||
                      'Line items'}
                  </TableCell>
                  <TableCell>
                    {stringOverrides?.lineItemsTable?.debitColumnHeader ||
                      'Debit'}
                  </TableCell>
                  <TableCell>
                    {stringOverrides?.lineItemsTable?.creditColumnHeader ||
                      'Credit'}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entryData?.line_items?.map((item, index) => (
                  <TableRow
                    key={`ledger-line-item-${index}`}
                    rowKey={`ledger-line-item-${index}`}
                  >
                    <TableCell>{item.account?.name || ''}</TableCell>
                    <TableCell>
                      {item.direction === Direction.DEBIT && (
                        <Badge variant={BadgeVariant.WARNING}>
                          ${centsToDollars(item.amount || 0)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.direction === Direction.CREDIT && (
                        <Badge variant={BadgeVariant.SUCCESS}>
                          ${centsToDollars(item.amount || 0)}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow
                  rowKey='ledger-line-item-summation'
                  variant='summation'
                >
                  <TableCell primary>
                    {stringOverrides?.lineItemsTable?.totalRowHeader || 'Total'}
                  </TableCell>
                  <TableCell isCurrency primary>
                    {totalDebit || 0}
                  </TableCell>
                  <TableCell isCurrency primary>
                    {totalCredit || 0}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
