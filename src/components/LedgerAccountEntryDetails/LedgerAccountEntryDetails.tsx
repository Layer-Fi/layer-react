import React, { useContext, useMemo } from 'react'
import X from '../../icons/X'
import { centsToDollars } from '../../models/Money'
import { Direction } from '../../types'
import { humanizeEnum } from '../../utils/format'
import { Badge } from '../Badge'
import { IconButton } from '../Button'
import { Card } from '../Card'
import { LedgerAccountsContext } from '../ChartOfAccounts/ChartOfAccounts'
import { DateTime } from '../DateTime'
import { DetailsList, DetailsListItem } from '../DetailsList'

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
      <DetailsList
        title='Transaction source'
        actions={
          <IconButton icon={<X />} onClick={() => closeSelectedEntry()} />
        }
      >
        <DetailsListItem label='Source' isLoading={isLoadingEntry}>
          <Badge>Invoice</Badge>
        </DetailsListItem>
        <DetailsListItem label='Number' isLoading={isLoadingEntry}>
          1234
        </DetailsListItem>
        <DetailsListItem label='Date' isLoading={isLoadingEntry}>
          May 5, 2023
        </DetailsListItem>
        <DetailsListItem label='Account' isLoading={isLoadingEntry}>
          89 8888 7656 6666 0000 6765
        </DetailsListItem>
      </DetailsList>

      <DetailsList title='Journal Entry #123' className='Layer__border-top'>
        <DetailsListItem label='Entry type' isLoading={isLoadingEntry}>
          {humanizeEnum(entryData?.entry_type ?? '')}
        </DetailsListItem>
        <DetailsListItem label='Date' isLoading={isLoadingEntry}>
          {entryData?.entry_at && <DateTime value={entryData?.entry_at} />}
        </DetailsListItem>
        <DetailsListItem label='Creation date' isLoading={isLoadingEntry}>
          {entryData?.date && <DateTime value={entryData?.date} />}
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
                {entryData?.line_items?.map(item => (
                  <tr key={`ledger-line-item-${item.id}`}>
                    <td className='Layer__table-cell'>
                      {item.account?.name || ''}
                    </td>
                    <td className='Layer__table-cell Layer__table-cell--amount'>
                      {item.direction === Direction.DEBIT && (
                        <Badge>${centsToDollars(item.amount || 0)}</Badge>
                      )}
                    </td>
                    <td className='Layer__table-cell Layer__table-cell--amount'>
                      {item.direction === Direction.CREDIT && (
                        <Badge>${centsToDollars(item.amount || 0)}</Badge>
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
