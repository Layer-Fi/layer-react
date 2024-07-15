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
import { is } from 'date-fns/locale'

/*

    @SerialName("Transaction_Ledger_Entry_Source")
    @SerialName("Invoice_Ledger_Entry_Source")
    @SerialName("Manual_Ledger_Entry_Source")
    @SerialName("Invoice_Payment_Ledger_Entry_Source")
    @SerialName("Refund_Ledger_Entry_Source")
    @SerialName("Opening_Balance_Ledger_Entry_Source")
    @SerialName("Payout_Ledger_Entry_Source")
    */
export const SourceDetailView = ({ source }: { source: LedgerEntrySource }) => {
  switch (source.type) {
    case 'Transaction_Ledger_Entry_Source': {
      const transactionSource = source as TransactionLedgerEntrySource
      return (
        <>
          <DetailsListItem label='Account name'>
            {transactionSource.account_name}
          </DetailsListItem>
          <DetailsListItem label='Date'>
            <DateTime value={transactionSource.date} />
          </DetailsListItem>
          <DetailsListItem label='Amount'>
            {`$${centsToDollars(transactionSource.amount)}`}
          </DetailsListItem>
          <DetailsListItem label='Direction'>
            {transactionSource.direction}
          </DetailsListItem>
          <DetailsListItem label='Counterparty'>
            {transactionSource.counterparty}
          </DetailsListItem>
        </>
      )
    }
    case 'Invoice_Ledger_Entry_Source': {
      const invoiceSource = source as InvoiceLedgerEntrySource
      return (
        <>
          <DetailsListItem label='Invoice number'>
            {invoiceSource.invoice_number}
          </DetailsListItem>
          <DetailsListItem label='Recipient name'>
            {invoiceSource.recipient_name}
          </DetailsListItem>
          <DetailsListItem label='Date'>
            <DateTime value={invoiceSource.date} />
          </DetailsListItem>
          <DetailsListItem label='Amount'>
            {`$${centsToDollars(invoiceSource.amount)}`}
          </DetailsListItem>
        </>
      )
    }
    case 'Manual_Ledger_Entry_Source': {
      const manualSource = source as ManualLedgerEntrySource
      return (
        <>
          <DetailsListItem label='Memo'>{manualSource.memo}</DetailsListItem>
          <DetailsListItem label='Created by'>
            {manualSource.created_by}
          </DetailsListItem>
        </>
      )
    }
    case 'Invoice_Payment_Ledger_Entry_Source': {
      const invoicePaymentSource = source as InvoicePaymentLedgerEntrySource
      return (
        <>
          <DetailsListItem label='Invoice number'>
            {invoicePaymentSource.invoice_number}
          </DetailsListItem>
          <DetailsListItem label='Amount'>
            {`$${centsToDollars(invoicePaymentSource.amount)}`}
          </DetailsListItem>
        </>
      )
    }
    case 'Refund_Ledger_Entry_Source': {
      const refundSource = source as RefundPaymentLedgerEntrySource
      return (
        <>
          <DetailsListItem label='Amount'>
            {`$${centsToDollars(refundSource.refunded_to_customer_amount)}`}
          </DetailsListItem>
          <DetailsListItem label='Recipient name'>
            {refundSource.recipient_name}
          </DetailsListItem>
        </>
      )
    }
    case 'Opening_Balance_Ledger_Entry_Source': {
      const openingBalanceSource = source as OpeningBalanceLedgerEntrySource
      return (
        <>
          <DetailsListItem label='Account name'>
            {openingBalanceSource.account_name}
          </DetailsListItem>
        </>
      )
    }
    case 'Payout_Ledger_Entry_Source': {
      const payoutSource = source as PayoutLedgerEntrySource
      return (
        <>
          <DetailsListItem label='Amount'>
            {`$${centsToDollars(payoutSource.paid_out_amount)}`}
          </DetailsListItem>
          <DetailsListItem label='Processor'>
            {payoutSource.processor}
          </DetailsListItem>
        </>
      )
    }

    default:
      return null
  }
}

export const LedgerAccountEntryDetails = () => {
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
          <Text weight={TextWeight.bold}>Transaction details</Text>
        </div>
      </div>
      <DetailsList
        title='Transaction source'
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
        <DetailsListItem label='Source' isLoading={isLoadingEntry}>
          <Badge>{entryData?.source?.entity_name}</Badge>
        </DetailsListItem>
        {entryData?.source?.display_description && (
          <SourceDetailView source={entryData?.source} />
        )}
      </DetailsList>

      <DetailsList
        title={`Journal Entry ${entryData?.id.substring(0, 5)}`}
        className='Layer__border-top'
      >
        <DetailsListItem label='Entry type' isLoading={isLoadingEntry}>
          {humanizeEnum(entryData?.entry_type ?? '')}
        </DetailsListItem>
        <DetailsListItem label='Date' isLoading={isLoadingEntry}>
          {entryData?.entry_at && <DateTime value={entryData?.entry_at} />}
        </DetailsListItem>
        <DetailsListItem label='Creation date' isLoading={isLoadingEntry}>
          {entryData?.date && <DateTime value={entryData?.date} />}
        </DetailsListItem>
        {entryData?.reversal_id && (
          <DetailsListItem label='Reversal' isLoading={isLoadingEntry}>
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
                  <TableCell>Line items</TableCell>
                  <TableCell>Debit</TableCell>
                  <TableCell>Credit</TableCell>
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
                  <TableCell primary>Total</TableCell>
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
