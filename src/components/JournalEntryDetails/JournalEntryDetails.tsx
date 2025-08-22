import { useContext, useMemo, useState } from 'react'
import { JournalContext } from '../../contexts/JournalContext'
import AlertCircle from '../../icons/AlertCircle'
import RefreshCcw from '../../icons/RefreshCcw'
import XIcon from '../../icons/X'
import { centsToDollars } from '../../models/Money'
import { convertLedgerEntrySourceToLinkingMetadata } from '../../schemas/generalLedger/ledgerEntrySource'
import { TableCellAlign } from '../../types/table'
import { humanizeEnum } from '../../utils/format'
import { Badge, BadgeVariant } from '../Badge'
import { BackButton, Button, ButtonVariant, CloseButton } from '../Button'
import { Card } from '../Card'
import { DateTime } from '../DateTime'
import { DetailsList, DetailsListItem } from '../DetailsList'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { SourceDetailView } from '../LedgerAccountEntryDetails/LedgerAccountEntryDetails'
import { Table, TableBody, TableCell, TableHead, TableRow } from '../Table'
import { Heading, HeadingSize } from '../Typography'
import { VStack } from '../ui/Stack/Stack'
import { Span } from '../ui/Typography/Text'
import { useInAppLinkContext } from '../../contexts/InAppLinkContext'
import { LedgerEntryDirection } from '../../schemas/generalLedger/ledgerAccount'
import { entryNumber, EntryType as LedgerEntryType } from '../../schemas/generalLedger/ledgerEntry'

export const JournalEntryDetails = () => {
  const {
    data,
    isLoadingEntry,
    errorEntry,
    closeSelectedEntry,
    selectedEntryId,
    reverseEntry,
    refetch,
  } = useContext(JournalContext)
  const { convertToInAppLink } = useInAppLinkContext()
  const [reverseEntryProcessing, setReverseEntryProcessing] = useState(false)
  const [reverseEntryError, setReverseEntryError] = useState<string>()

  const entry = useMemo(() => {
    if (selectedEntryId && data) {
      return data.find(x => x.id === selectedEntryId)
    }

    return
  }, [data, selectedEntryId])

  const badgeOrInAppLink = useMemo(() => {
    const badgeContent = entry?.source?.entityName ?? entry?.entryType
    const defaultBadge = <Badge>{badgeContent}</Badge>
    if (!convertToInAppLink || !entry?.source) {
      return defaultBadge
    }
    const linkingMetadata = convertLedgerEntrySourceToLinkingMetadata(entry?.source)
    return convertToInAppLink(linkingMetadata) ?? defaultBadge
  }, [convertToInAppLink, entry?.entryType, entry?.source])

  const lineItemRows = useMemo(
    () => {
      return entry?.lineItems.map((item) => {
        return {
          accountName: item.account.name,
          direction: item.direction,
          amount: item.amount,
        }
      }).sort((a, b) =>
        a.direction > b.direction ? -1 : a.direction < b.direction ? 1 : 0,
      )?.map((item, index) => (
        <TableRow
          key={`ledger-line-item-${index}`}
          rowKey={`ledger-line-item-${index}`}
        >
          <TableCell>{item.accountName}</TableCell>
          <TableCell
            className='Layer__journal__debit-credit-col'
            align={TableCellAlign.RIGHT}
          >
            {item.direction === LedgerEntryDirection.Debit && (
              <Badge variant={BadgeVariant.WARNING}>
                $
                {centsToDollars(item.amount || 0)}
              </Badge>
            )}
          </TableCell>
          <TableCell
            className='Layer__journal__debit-credit-col'
            align={TableCellAlign.RIGHT}
          >
            {item.direction === LedgerEntryDirection.Credit && (
              <Badge variant={BadgeVariant.SUCCESS}>
                $
                {centsToDollars(item.amount || 0)}
              </Badge>
            )}
          </TableCell>
        </TableRow>
      ))
    }, [entry?.lineItems],
  )

  const onReverseEntry = async () => {
    if (!entry) {
      return
    }
    try {
      setReverseEntryProcessing(true)
      setReverseEntryError(undefined)
      await reverseEntry(entry.id)
      refetch()
    }
    catch (_err) {
      setReverseEntryError('Failed')
    }
    finally {
      setReverseEntryProcessing(false)
    }
  }

  return (
    <div className='Layer__journal__entry-details'>
      <Header className='Layer__journal__entry-details__mobile-header'>
        <HeaderRow>
          <HeaderCol className='Layer__hidden-lg Layer__hidden-xl'>
            <BackButton onClick={closeSelectedEntry} />
            <Heading size={HeadingSize.secondary}>Transaction details</Heading>
          </HeaderCol>
          <HeaderCol className='Layer__show-lg Layer__show-xl'>
            <Heading size={HeadingSize.secondary}>Transaction source</Heading>
          </HeaderCol>
          <HeaderCol className='Layer__show-lg Layer__show-xl'>
            <CloseButton onClick={closeSelectedEntry} />
          </HeaderCol>
        </HeaderRow>
      </Header>
      <DetailsList
        title='Transaction source'
        titleClassName='Layer__hidden-lg Layer__hidden-xl'
        actions={(
          <Button
            rightIcon={<XIcon />}
            iconOnly={true}
            onClick={closeSelectedEntry}
            className='Layer__details-list__close-btn'
            variant={ButtonVariant.secondary}
          />
        )}
      >
        <DetailsListItem label='Source' isLoading={isLoadingEntry}>
          {badgeOrInAppLink}
        </DetailsListItem>
        {entry?.source && (
          <SourceDetailView source={entry?.source} />
        )}
      </DetailsList>
      <DetailsList
        title={(
          <VStack>
            <Span>Journal Entry</Span>
            {entry && <Span variant='subtle' size='xs'>{`Journal ID #${entryNumber(entry)}`}</Span>}
          </VStack>
        )}
        className='Layer__border-top'
      >
        <DetailsListItem label='Entry type' isLoading={isLoadingEntry}>
          {humanizeEnum(entry?.entryType ?? '')}
        </DetailsListItem>
        <DetailsListItem label='Effective date' isLoading={isLoadingEntry}>
          {entry?.entryAt && <DateTime value={entry?.entryAt.toDateString()} />}
        </DetailsListItem>
        <DetailsListItem label='Creation date' isLoading={isLoadingEntry}>
          {entry?.date && <DateTime value={entry?.date.toDateString()} />}
        </DetailsListItem>
        {entry?.reversalId && (
          <DetailsListItem label='Reversal' isLoading={isLoadingEntry}>
            {`Journal Entry #${entry?.reversalId.substring(0, 5)}`}
          </DetailsListItem>
        )}
      </DetailsList>
      {!isLoadingEntry && !errorEntry
        ? (
          <div className='Layer__journal__entry-details__line-items'>
            <Card>
              <Table
                componentName='journal__entry-details'
                borderCollapse='collapse'
              >
                <TableHead>
                  <TableRow rowKey='soc-flow-head-row' isHeadRow>
                    <TableCell>Line items</TableCell>
                    <TableCell
                      className='Layer__journal__debit-credit-col'
                      align={TableCellAlign.RIGHT}
                    >
                      Debit
                    </TableCell>
                    <TableCell
                      className='Layer__journal__debit-credit-col'
                      align={TableCellAlign.RIGHT}
                    >
                      Credit
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lineItemRows}
                  <TableRow
                    rowKey='ledger-line-item-summation'
                    variant='summation'
                  >
                    <TableCell primary>Total</TableCell>
                    <TableCell
                      isCurrency
                      primary
                      className='Layer__journal__debit-credit-col'
                      align={TableCellAlign.RIGHT}
                    >
                      {entry?.lineItems
                        .filter(item => item.direction === LedgerEntryDirection.Debit)
                        .map(item => item.amount)
                        .reduce((a, b) => a + b, 0) || 0}
                    </TableCell>
                    <TableCell
                      isCurrency
                      primary
                      className='Layer__journal__debit-credit-col'
                      align={TableCellAlign.RIGHT}
                    >
                      {entry?.lineItems
                        .filter(item => item.direction === LedgerEntryDirection.Credit)
                        .map(item => item.amount)
                        .reduce((a, b) => a + b, 0) || 0}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>

            {entry?.entryType === LedgerEntryType.Manual && (
              <div className='Layer__journal__entry-details__reverse-btn-container'>
                <Button
                  rightIcon={
                    reverseEntryError
                      ? (
                        <AlertCircle size={12} />
                      )
                      : (
                        <RefreshCcw size={12} />
                      )
                  }
                  variant={ButtonVariant.secondary}
                  onClick={reverseEntryProcessing ? () => {} : onReverseEntry}
                  isProcessing={reverseEntryProcessing}
                  tooltip={
                    (Boolean(entry?.reversalId)
                      && 'This entry has already been reversed')
                    ?? (reverseEntryError && 'Operation failed. Try again.')
                  }
                  disabled={Boolean(entry?.reversalId)}
                >
                  Reverse entry
                </Button>
              </div>
            )}
          </div>
        )
        : null}
    </div>
  )
}
