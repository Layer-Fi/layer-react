import React, { useContext, useMemo } from 'react'
import { DATE_FORMAT } from '../../config/general'
import X from '../../icons/X'
import { centsToDollars } from '../../models/Money'
import { Direction } from '../../types'
import { humanizeEnum } from '../../utils/format'
import { Badge } from '../Badge'
import { IconButton } from '../Button'
import { Card } from '../Card'
import { LedgerAccountsContext } from '../ChartOfAccounts/ChartOfAccounts'
import { DetailsList, DetailsListItem } from '../DetailsList'
import { parseISO, format as formatTime } from 'date-fns'

export const LedgerAccountEntryDetails = () => {
  const { entryData, closeSelectedEntry } = useContext(LedgerAccountsContext)

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
        <DetailsListItem label='Source'>
          <Badge>Invoice</Badge>
        </DetailsListItem>
        <DetailsListItem label='Number'>1234</DetailsListItem>
        <DetailsListItem label='Date'>May 5, 2023</DetailsListItem>
        <DetailsListItem label='Account'>
          89 8888 7656 6666 0000 6765
        </DetailsListItem>
      </DetailsList>

      <DetailsList title='Journal Entry #123' className='Layer__border-top'>
        <DetailsListItem label='Entry type'>
          {humanizeEnum(entryData?.entry_type ?? '')}
        </DetailsListItem>
        <DetailsListItem label='Created by'>Customer A TBD</DetailsListItem>
        <DetailsListItem label='Date'>
          {entryData?.entry_at &&
            formatTime(parseISO(entryData?.entry_at), DATE_FORMAT)}
        </DetailsListItem>
        <DetailsListItem label='Creation date'>
          {entryData?.date &&
            formatTime(parseISO(entryData?.date), DATE_FORMAT)}
        </DetailsListItem>
        <DetailsListItem label='Reversal'>
          Journal Entry #79 TBD
        </DetailsListItem>
      </DetailsList>

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
    </div>
  )
}
