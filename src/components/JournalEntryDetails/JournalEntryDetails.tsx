import React, { useContext, useMemo } from 'react'
import { JournalContext } from '../../contexts/JournalContext'
import XIcon from '../../icons/X'
import { centsToDollars } from '../../models/Money'
import { Direction } from '../../types'
import { humanizeEnum } from '../../utils/format'
import { Badge, BadgeVariant } from '../Badge'
import { Button, ButtonVariant } from '../Button'
import { Card } from '../Card'
import { DateTime } from '../DateTime'
import { DetailsList, DetailsListItem } from '../DetailsList'
import { SourceDetailView } from '../LedgerAccountEntryDetails/LedgerAccountEntryDetails'

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
      <DetailsList
        title='Transaction source'
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
        title={`Journal Entry ${entry?.id.substring(0, 5)}`}
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
                {entry?.line_items?.map((item, index) => (
                  <tr key={`ledger-line-item-${index}`}>
                    <td className='Layer__table-cell'>
                      {item.account_identifier?.name || ''}
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
                    $
                    {centsToDollars(
                      Math.abs(
                        entry?.line_items
                          .filter(item => item.direction === 'DEBIT')
                          .map(item => item.amount)
                          .reduce((a, b) => a + b, 0) || 0,
                      ),
                    )}
                  </td>
                  <td className='Layer__table-cell Layer__table-cell--amount'>
                    $
                    {centsToDollars(
                      Math.abs(
                        entry?.line_items
                          .filter(item => item.direction === 'CREDIT')
                          .map(item => item.amount)
                          .reduce((a, b) => a + b, 0) || 0,
                      ),
                    )}
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
