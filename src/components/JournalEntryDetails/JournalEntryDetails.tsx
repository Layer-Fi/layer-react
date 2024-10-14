import React, { useContext, useMemo } from 'react'
import { JournalContext } from '../../contexts/JournalContext'
import XIcon from '../../icons/X'
import { centsToDollars } from '../../models/Money'
import { Direction } from '../../types'
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

export const JournalEntryDetails = () => {
  const {
    data,
    isLoadingEntry,
    errorEntry,
    closeSelectedEntry,
    selectedEntryId,
  } = useContext(JournalContext)

  const entry = useMemo(() => {
    if (selectedEntryId && data) {
      return data.find(x => x.id === selectedEntryId)
    }

    return
  }, [data, selectedEntryId])

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
        actions={
          <Button
            rightIcon={<XIcon />}
            iconOnly={true}
            onClick={closeSelectedEntry}
            className='Layer__details-list__close-btn'
            variant={ButtonVariant.secondary}
          />
        }
      >
        <DetailsListItem label='Source' isLoading={isLoadingEntry}>
          <Badge>{entry?.source?.entity_name}</Badge>
        </DetailsListItem>
        {entry?.source?.display_description && (
          <SourceDetailView source={entry?.source} />
        )}
      </DetailsList>
      <DetailsList
        title={`Journal Entry ${entry ? entryNumber(entry) : ''}`}
        className='Layer__border-top'
      >
        <DetailsListItem label='Entry type' isLoading={isLoadingEntry}>
          {humanizeEnum(entry?.entry_type ?? '')}
        </DetailsListItem>
        <DetailsListItem label='Date' isLoading={isLoadingEntry}>
          {entry?.entry_at && <DateTime value={entry?.entry_at} />}
        </DetailsListItem>
        <DetailsListItem label='Creation date' isLoading={isLoadingEntry}>
          {entry?.date && <DateTime value={entry?.date} />}
        </DetailsListItem>
        {entry?.reversal_id && (
          <DetailsListItem label='Reversal' isLoading={isLoadingEntry}>
            Journal Entry #{entry?.reversal_id}
          </DetailsListItem>
        )}
      </DetailsList>
      {!isLoadingEntry && !errorEntry ? (
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
                {entry?.line_items?.map((item, index) => (
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
                          ${centsToDollars(item.amount || 0)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className='Layer__journal__debit-credit-col'
                      align={TableCellAlign.RIGHT}
                    >
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
                  <TableCell
                    isCurrency
                    primary
                    className='Layer__journal__debit-credit-col'
                    align={TableCellAlign.RIGHT}
                  >
                    {entry?.line_items
                      .filter(item => item.direction === 'DEBIT')
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
                      .filter(item => item.direction === 'CREDIT')
                      .map(item => item.amount)
                      .reduce((a, b) => a + b, 0) || 0}
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
