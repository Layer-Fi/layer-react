import { useContext, useMemo } from 'react'
import { LedgerAccountsContext } from '../../contexts/LedgerAccountsContext'
import XIcon from '../../icons/X'
import { Direction } from '../../types'
import { LedgerEntrySourceType, decodeLedgerEntrySource, convertLedgerEntrySourceToLinkingMetadata } from '../../schemas/ledgerEntrySourceSchemas'
import { TableCellAlign } from '../../types/table'
import { convertCentsToCurrency, humanizeEnum } from '../../utils/format'
import { entryNumber } from '../../utils/journal'
import { Badge, BadgeVariant } from '../Badge'
import { BackButton, Button, ButtonVariant, CloseButton } from '../Button'
import { Card } from '../Card'
import { DateTime } from '../DateTime'
import { DetailsList, DetailsListItem } from '../DetailsList'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Table } from '../Table'
import { TableBody } from '../TableBody'
import { TableCell } from '../TableCell'
import { TableHead } from '../TableHead'
import { TableRow } from '../TableRow'
import { Heading, HeadingSize } from '../Typography'
import { Span } from '../ui/Typography/Text'
import { VStack } from '../ui/Stack/Stack'
import { useInAppLinkContext } from '../../contexts/InAppLinkContext'

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

export const SourceDetailView = ({
  source,
  stringOverrides,
}: {
  source: LedgerEntrySourceType
  stringOverrides?: SourceDetailStringOverrides
}) => {
  switch (source.type) {
    case 'Transaction_Ledger_Entry_Source': {
      return (
        <>
          <DetailsListItem
            label={stringOverrides?.accountNameLabel || 'Account name'}
          >
            {source.accountName}
          </DetailsListItem>
          <DetailsListItem label={stringOverrides?.dateLabel || 'Date'}>
            <DateTime value={source.date} />
          </DetailsListItem>
          <DetailsListItem label={stringOverrides?.amountLabel || 'Amount'}>
            {convertCentsToCurrency(source.amount)}
          </DetailsListItem>
          <DetailsListItem
            label={stringOverrides?.directionLabel || 'Direction'}
          >
            {source.direction}
          </DetailsListItem>
          <DetailsListItem
            label={stringOverrides?.counterpartyLabel || 'Counterparty'}
          >
            {source.counterparty || source.displayDescription}
          </DetailsListItem>
        </>
      )
    }
    case 'Invoice_Ledger_Entry_Source': {
      return (
        <>
          <DetailsListItem
            label={stringOverrides?.invoiceNumberLabel || 'Invoice number'}
          >
            {source.invoiceNumber}
          </DetailsListItem>
          <DetailsListItem
            label={stringOverrides?.recipientNameLabel || 'Recipient name'}
          >
            {source.recipientName}
          </DetailsListItem>
          <DetailsListItem label={stringOverrides?.dateLabel || 'Date'}>
            <DateTime value={source.date} />
          </DetailsListItem>
          <DetailsListItem label={stringOverrides?.amountLabel || 'Amount'}>
            {convertCentsToCurrency(source.amount)}
          </DetailsListItem>
        </>
      )
    }
    case 'Manual_Ledger_Entry_Source': {
      return (
        <>
          <DetailsListItem label={stringOverrides?.memoLabel || 'Memo'}>
            {source.memo}
          </DetailsListItem>
          <DetailsListItem
            label={stringOverrides?.createdByLabel || 'Created by'}
          >
            {source.createdBy}
          </DetailsListItem>
        </>
      )
    }
    case 'Invoice_Payment_Ledger_Entry_Source': {
      return (
        <>
          <DetailsListItem
            label={stringOverrides?.invoiceNumberLabel || 'Invoice number'}
          >
            {source.invoiceNumber}
          </DetailsListItem>
          <DetailsListItem label={stringOverrides?.amountLabel || 'Amount'}>
            {convertCentsToCurrency(source.amount)}
          </DetailsListItem>
        </>
      )
    }
    case 'Refund_Allocation_Ledger_Entry_Source': {
      return (
        <>
          <DetailsListItem label={stringOverrides?.amountLabel || 'Amount'}>
            {convertCentsToCurrency(source.amount)}
          </DetailsListItem>
          <DetailsListItem
            label={stringOverrides?.recipientNameLabel || 'Recipient name'}
          >
            {source.recipientName}
          </DetailsListItem>
        </>
      )
    }
    case 'Refund_Payment_Ledger_Entry_Source': {
      return (
        <>
          <DetailsListItem label={stringOverrides?.amountLabel || 'Amount'}>
            {convertCentsToCurrency(source.refundedToCustomerAmount)}
          </DetailsListItem>
          <DetailsListItem
            label={stringOverrides?.recipientNameLabel || 'Recipient name'}
          >
            {source.recipientName}
          </DetailsListItem>
        </>
      )
    }
    case 'Opening_Balance_Ledger_Entry_Source': {
      return (
        <DetailsListItem
          label={stringOverrides?.accountNameLabel || 'Account name'}
        >
          {source.accountName}
        </DetailsListItem>
      )
    }
    case 'Payout_Ledger_Entry_Source': {
      return (
        <>
          <DetailsListItem label={stringOverrides?.amountLabel || 'Amount'}>
            {convertCentsToCurrency(source.paidOutAmount)}
          </DetailsListItem>
          <DetailsListItem
            label={stringOverrides?.processorLabel || 'Processor'}
          >
            {source.processor}
          </DetailsListItem>
        </>
      )
    }

    case 'Quickbooks_Ledger_Entry_Source': {
      return (
        <>
          <DetailsListItem
            label='Quickbooks ID'
          >
            {source.quickbooksId}
          </DetailsListItem>
          <DetailsListItem label='Import Date'>
            <DateTime value={source.importDate} />
          </DetailsListItem>
        </>
      )
    }
    case 'Invoice_Write_Off_Ledger_Entry_Source': {
      return (
        <>
          <DetailsListItem
            label={stringOverrides?.invoiceNumberLabel || 'Invoice number'}
          >
            {source.invoiceNumber}
          </DetailsListItem>
          <DetailsListItem
            label={stringOverrides?.recipientNameLabel || 'Recipient name'}
          >
            {source.recipientName}
          </DetailsListItem>
          <DetailsListItem label='Write-off Date'>
            <DateTime value={source.date} />
          </DetailsListItem>
          <DetailsListItem label='Write-off Amount'>
            {convertCentsToCurrency(source.writeOffAmount)}
          </DetailsListItem>
        </>
      )
    }
    case 'Vendor_Refund_Allocation_Ledger_Entry_Source': {
      return (
        <>
          <DetailsListItem label={stringOverrides?.amountLabel || 'Amount'}>
            {convertCentsToCurrency(source.amount)}
          </DetailsListItem>
          <DetailsListItem label='Vendor Description'>
            {source.vendorDescription}
          </DetailsListItem>
        </>
      )
    }
    case 'Vendor_Refund_Payment_Ledger_Entry_Source': {
      return (
        <>
          <DetailsListItem label='Refunded Amount'>
            {convertCentsToCurrency(source.refundedByVendorAmount)}
          </DetailsListItem>
          <DetailsListItem label='Vendor Description'>
            {source.vendorDescription}
          </DetailsListItem>
        </>
      )
    }
    case 'Vendor_Payout_Ledger_Entry_Source': {
      return (
        <>
          <DetailsListItem label={stringOverrides?.amountLabel || 'Amount'}>
            {convertCentsToCurrency(source.paidOutAmount)}
          </DetailsListItem>
          <DetailsListItem
            label={stringOverrides?.processorLabel || 'Processor'}
          >
            {source.processor}
          </DetailsListItem>
          <DetailsListItem label='Completed At'>
            <DateTime value={source.completedAt} />
          </DetailsListItem>
        </>
      )
    }
    case 'Payroll_Ledger_Entry_Source': {
      return (
        <DetailsListItem label='Payday'>
          <DateTime value={source.payday} />
        </DetailsListItem>
      )
    }
    case 'Payroll_Payment_Ledger_Entry_Source': {
      return (
        <DetailsListItem label={stringOverrides?.amountLabel || 'Amount'}>
          {convertCentsToCurrency(source.amount)}
        </DetailsListItem>
      )
    }
    case 'Bill_Ledger_Entry_Source': {
      return (
        <>
          <DetailsListItem label='Bill Number'>
            {source.billNumber}
          </DetailsListItem>
          <DetailsListItem label='Vendor Description'>
            {source.vendorDescription}
          </DetailsListItem>
          <DetailsListItem label={stringOverrides?.dateLabel || 'Date'}>
            <DateTime value={source.date} />
          </DetailsListItem>
          <DetailsListItem label={stringOverrides?.amountLabel || 'Amount'}>
            {convertCentsToCurrency(source.amount)}
          </DetailsListItem>
        </>
      )
    }
    case 'Bill_Payment_Ledger_Entry_Source': {
      return (
        <>
          <DetailsListItem label='Bill Number'>
            {source.billNumber}
          </DetailsListItem>
          <DetailsListItem label={stringOverrides?.amountLabel || 'Amount'}>
            {convertCentsToCurrency(source.amount)}
          </DetailsListItem>
        </>
      )
    }
    case 'Vendor_Credit_Ledger_Entry_Source': {
      return (
        <>
          <DetailsListItem label={stringOverrides?.amountLabel || 'Amount'}>
            {convertCentsToCurrency(source.amount)}
          </DetailsListItem>
          <DetailsListItem label='Vendor'>
            {source.vendor.description}
          </DetailsListItem>
        </>
      )
    }
    case 'Customer_Credit_Ledger_Entry_Source': {
      return (
        <>
          <DetailsListItem label={stringOverrides?.amountLabel || 'Amount'}>
            {convertCentsToCurrency(source.amount)}
          </DetailsListItem>
          <DetailsListItem label='Customer'>
            {source.customer.description}
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
  const { convertToInAppLink } = useInAppLinkContext()

  const { totalDebit, totalCredit } = useMemo(() => {
    let totalDebit = 0
    let totalCredit = 0
    entryData?.line_items?.forEach((item) => {
      if (item.direction === Direction.CREDIT) {
        totalCredit += item.amount || 0
      }
      else if (item.direction === Direction.DEBIT) {
        totalDebit += item.amount || 0
      }
    })

    return { totalDebit, totalCredit }
  }, [entryData])

  const badgeOrInAppLink = useMemo(() => {
    const decoded = entryData?.source ? decodeLedgerEntrySource(entryData.source) : null
    const badgeContent = decoded?.entityName ?? entryData?.entry_type
    const defaultBadge = <Badge>{badgeContent}</Badge>
    if (!convertToInAppLink || !decoded) {
      return defaultBadge
    }
    const linkingMetadata = convertLedgerEntrySourceToLinkingMetadata(decoded)
    return convertToInAppLink(linkingMetadata) ?? defaultBadge
  }, [convertToInAppLink, entryData?.entry_type, entryData?.source])

  return (
    <div className='Layer__ledger-account__entry-details'>
      <Header className='Layer__ledger-account__entry-details__header'>
        <HeaderRow>
          <HeaderCol className='Layer__hidden-lg Layer__hidden-xl'>
            <BackButton onClick={closeSelectedEntry} />
            <Heading size={HeadingSize.secondary}>
              {stringOverrides?.title || 'Transaction details'}
            </Heading>
          </HeaderCol>
          <HeaderCol className='Layer__show-lg Layer__show-xl'>
            <Heading size={HeadingSize.secondary}>
              {stringOverrides?.transactionSource?.header
                || 'Transaction source'}
            </Heading>
          </HeaderCol>
          <HeaderCol className='Layer__show-lg Layer__show-xl'>
            <CloseButton onClick={closeSelectedEntry} />
          </HeaderCol>
        </HeaderRow>
      </Header>
      <DetailsList
        title={
          stringOverrides?.transactionSource?.header || 'Transaction source'
        }
        titleClassName='Layer__hidden-lg Layer__hidden-xl'
        actions={(
          <Button
            rightIcon={<XIcon />}
            iconOnly={true}
            onClick={closeSelectedEntry}
            variant={ButtonVariant.secondary}
            className='Layer__details-list__close-btn'
          />
        )}
      >
        <DetailsListItem
          label={
            stringOverrides?.transactionSource?.details?.sourceLabel || 'Source'
          }
          isLoading={isLoadingEntry}
        >
          {badgeOrInAppLink}
        </DetailsListItem>
        {entryData?.source?.displayDescription && (
          <SourceDetailView source={entryData?.source} />
        )}
      </DetailsList>

      <DetailsList
        title={
          stringOverrides?.journalEntry?.header
            ? stringOverrides?.journalEntry?.header(
              entryData ? entryNumber(entryData) : '',
            )
            : (
              <VStack>
                <Span>Journal Entry</Span>
                {entryData && <Span variant='subtle' size='xs'>{`Journal ID #${entryNumber(entryData)}`}</Span>}
              </VStack>
            )
        }
        className='Layer__border-top'
      >
        <DetailsListItem
          label={
            stringOverrides?.journalEntry?.details?.entryTypeLabel
            || 'Entry type'
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
            stringOverrides?.journalEntry?.details?.creationDateLabel
            || 'Creation date'
          }
          isLoading={isLoadingEntry}
        >
          {entryData?.date && <DateTime value={entryData?.date} />}
        </DetailsListItem>
        {entryData?.reversal_id && (
          <DetailsListItem
            label={
              stringOverrides?.journalEntry?.details?.reversalLabel
              || 'Reversal'
            }
            isLoading={isLoadingEntry}
          >
            {entryData?.reversal_id.substring(0, 5)}
          </DetailsListItem>
        )}
      </DetailsList>

      {!isLoadingEntry && !errorEntry
        ? (
          <div className='Layer__ledger-account__entry-details__line-items'>
            <Card>
              <Table
                componentName='ledger-account__entry-details'
                borderCollapse='collapse'
              >
                <TableHead>
                  <TableRow rowKey='soc-flow-head-row' isHeadRow>
                    <TableCell>
                      {stringOverrides?.lineItemsTable?.lineItemsColumnHeader
                        || 'Line items'}
                    </TableCell>
                    <TableCell align={TableCellAlign.RIGHT}>
                      {stringOverrides?.lineItemsTable?.debitColumnHeader
                        || 'Debit'}
                    </TableCell>
                    <TableCell align={TableCellAlign.RIGHT}>
                      {stringOverrides?.lineItemsTable?.creditColumnHeader
                        || 'Credit'}
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
                      <TableCell align={TableCellAlign.RIGHT}>
                        {item.direction === Direction.DEBIT && (
                          <Badge variant={BadgeVariant.WARNING}>
                            {convertCentsToCurrency(item.amount || 0)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell align={TableCellAlign.RIGHT}>
                        {item.direction === Direction.CREDIT && (
                          <Badge variant={BadgeVariant.SUCCESS}>
                            {convertCentsToCurrency(item.amount || 0)}
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
                    <TableCell isCurrency primary align={TableCellAlign.RIGHT}>
                      {totalDebit || 0}
                    </TableCell>
                    <TableCell isCurrency primary align={TableCellAlign.RIGHT}>
                      {totalCredit || 0}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          </div>
        )
        : null}
    </div>
  )
}
