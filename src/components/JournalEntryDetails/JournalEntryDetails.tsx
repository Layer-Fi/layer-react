import { useContext, useMemo, useState } from 'react'
import { JournalContext } from '../../contexts/JournalContext'
import AlertCircle from '../../icons/AlertCircle'
import RefreshCcw from '../../icons/RefreshCcw'
import XIcon from '../../icons/X'
import { centsToDollars } from '../../models/Money'
import { Direction, LedgerEntrySourceType } from '../../types'
import { decodeLedgerEntrySource } from '../../schemas/ledgerEntrySourceSchemas'
import { TableCellAlign } from '../../types/table'
import { humanizeEnum } from '../../utils/format'
import { entryNumber } from '../../utils/journal'
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
import { useLedgerEntrySourceContext } from '../../contexts/LedgerEntrySourceContext'

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
  const { convertToSourceLink } = useLedgerEntrySourceContext()
  const [reverseEntryProcessing, setReverseEntryProcessing] = useState(false)
  const [reverseEntryError, setReverseEntryError] = useState<string>()

  const entry = useMemo(() => {
    if (selectedEntryId && data) {
      return data.find(x => x.id === selectedEntryId)
    }

    return
  }, [data, selectedEntryId])

  const sourceLink = useMemo(() => {
    if (convertToSourceLink && entry?.source) {
      const decoded: LedgerEntrySourceType | null = decodeLedgerEntrySource(entry.source)
      return decoded ? convertToSourceLink(decoded) : undefined
    }
    return undefined
  }, [convertToSourceLink, entry?.source])

  const sortedLineItems = useMemo(
    () =>
      entry?.line_items?.sort((a, b) =>
        a.direction > b.direction ? -1 : a.direction < b.direction ? 1 : 0,
      ),
    [entry?.line_items],
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
          <Badge>
            {sourceLink
              ? (
                <a
                  href={sourceLink.href}
                  target={sourceLink.target}
                >
                  {sourceLink.text}
                </a>
              )
              : (entry?.source && decodeLedgerEntrySource(entry.source)?.entityName) ?? entry?.entry_type }
          </Badge>
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
          {humanizeEnum(entry?.entry_type ?? '')}
        </DetailsListItem>
        <DetailsListItem label='Effective date' isLoading={isLoadingEntry}>
          {entry?.entry_at && <DateTime value={entry?.entry_at} />}
        </DetailsListItem>
        <DetailsListItem label='Creation date' isLoading={isLoadingEntry}>
          {entry?.date && <DateTime value={entry?.date} />}
        </DetailsListItem>
        {entry?.reversal_id && (
          <DetailsListItem label='Reversal' isLoading={isLoadingEntry}>
            {`Journal Entry #${entry?.reversal_id.substring(0, 5)}`}
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
                  {sortedLineItems?.map((item, index) => (
                    <TableRow
                      key={`ledger-line-item-${index}`}
                      rowKey={`ledger-line-item-${index}`}
                    >
                      <TableCell>{item.account.name}</TableCell>
                      <TableCell
                        className='Layer__journal__debit-credit-col'
                        align={TableCellAlign.RIGHT}
                      >
                        {item.direction === Direction.DEBIT && (
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
                        {item.direction === Direction.CREDIT && (
                          <Badge variant={BadgeVariant.SUCCESS}>
                            $
                            {centsToDollars(item.amount || 0)}
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
                    <TableCell
                      isCurrency
                      primary
                      className='Layer__journal__debit-credit-col'
                      align={TableCellAlign.RIGHT}
                    >
                      {entry?.line_items
                        .filter(item => item.direction === Direction.DEBIT)
                        .map(item => item.amount)
                        .reduce((a, b) => a + b, 0) || 0}
                    </TableCell>
                    <TableCell
                      isCurrency
                      primary
                      className='Layer__journal__debit-credit-col'
                      align={TableCellAlign.RIGHT}
                    >
                      {entry?.line_items
                        .filter(item => item.direction === Direction.CREDIT)
                        .map(item => item.amount)
                        .reduce((a, b) => a + b, 0) || 0}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>

            {entry?.entry_type === 'MANUAL' && (
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
                    (Boolean(entry?.reversal_id)
                      && 'This entry has already been reversed')
                    ?? (reverseEntryError && 'Operation failed. Try again.')
                  }
                  disabled={Boolean(entry?.reversal_id)}
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
