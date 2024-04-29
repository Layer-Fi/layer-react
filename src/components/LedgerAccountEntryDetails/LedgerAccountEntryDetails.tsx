import React, { useContext, useMemo } from 'react'
import X from '../../icons/X'
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
import { BackButton, IconButton } from '../Button'
import { Card } from '../Card'
import { LedgerAccountsContext } from '../ChartOfAccounts/ChartOfAccounts'
import { DateTime } from '../DateTime'
import { DetailsList, DetailsListItem } from '../DetailsList'
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
const SourceDetailView = ({ source }: { source: LedgerEntrySource }) => {
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
      </div>
      <DetailsList
        title='Transaction source'
        actions={
          <IconButton
            icon={<X />}
            onClick={() => closeSelectedEntry()}
            className='Layer__hidden-sm Layer__hidden-xs'
          />
        }
      >
        <DetailsListItem label='Source' isLoading={isLoadingEntry}>
          <Badge>{entryData?.source?.type}</Badge>
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
            <table className='Layer__table Layer__ledger-account__entry-details__table'>
              <thead>
                <tr>
                  <th className='Layer__table-header'>Line items</th>
                  <th className='Layer__table-header Layer__table-cell--amount'>
                    Debit
                  </th>
                  <th className='Layer__table-header Layer__table-cell--amount'>
                    Credit
                  </th>
                </tr>
              </thead>
              <tbody>
                {entryData?.line_items?.map(item => (
                  <tr key={`ledger-line-item-${item.id}`}>
                    <td className='Layer__table-cell'>
                      {item.account?.name || ''}
                    </td>
                    <td className='Layer__table-cell Layer__table-cell--amount'>
                      {item.direction === Direction.DEBIT && (
                        <Badge variant={BadgeVariant.WARNING}>
                          ${centsToDollars(item.amount || 0)}
                        </Badge>
                      )}
                    </td>
                    <td className='Layer__table-cell Layer__table-cell--amount'>
                      {item.direction === Direction.CREDIT && (
                        <Badge variant={BadgeVariant.SUCCESS}>
                          ${centsToDollars(item.amount || 0)}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className='Layer__table Layer__ledger-account__entry-details__table__total-row'>
                  <td className='Layer__table-cell'>Total</td>
                  <td className='Layer__table-cell Layer__table-cell--amount'>
                    ${centsToDollars(totalDebit || 0)}
                  </td>
                  <td className='Layer__table-cell Layer__table-cell--amount'>
                    ${centsToDollars(totalCredit || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
