import React, { useContext, useMemo } from 'react'
import { flattenEntries } from '../../hooks/useJournal/useJournal'
import { centsToDollars } from '../../models/Money'
import { Direction } from '../../types'
import { humanizeEnum } from '../../utils/format'
import { Badge, BadgeVariant } from '../Badge'
import { CloseButton } from '../Button'
import { Card } from '../Card'
import { DateTime } from '../DateTime'
import { DetailsList, DetailsListItem } from '../DetailsList'
import { JournalContext } from '../Journal'

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
      return flattenEntries(data || []).find(x => x.id === selectedEntryId)
    }

    return
  }, [data, selectedEntryId])

  return (
    <div className='Layer__journal__entry-details'>
      <DetailsList
        className='Layer__journal__entry-details__title'
        title='Journal Entry #123'
        actions={
          <div className='Layer__journal__entry-details__back-btn'>
            <CloseButton onClick={() => closeSelectedEntry()} />
          </div>
        }
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
        <DetailsListItem label='Reversal' isLoading={isLoadingEntry}>
          Journal Entry #79 TBD
        </DetailsListItem>
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
                {entry?.line_items?.map(item => (
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
                    $
                    {centsToDollars(
                      Math.abs(
                        entry?.line_items
                          .map(item => item.amount)
                          .reduce((a, b) => a + b, 0),
                      ) || 0,
                    )}
                  </td>
                  <td className='Layer__table-cell Layer__table-cell--amount'>
                    $
                    {centsToDollars(
                      Math.abs(
                        entry?.line_items
                          .map(item => item.amount)
                          .reduce((a, b) => a + b, 0),
                      ) || 0,
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
