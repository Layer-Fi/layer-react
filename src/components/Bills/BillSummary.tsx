import { useMemo } from 'react'
import { Bill } from '../../types'
import { isBillPaid } from '../../utils/bills'
import { convertFromCents, convertNumberToCurrency, formatDate } from '../../utils/format'
import { Text, TextSize, TextStatus, TextWeight } from '../Typography/Text'
import { differenceInDays, parseISO } from 'date-fns'
import { DATE_FORMAT_SHORT } from '../../config/general'

interface BillSummaryProps {
  bill: Bill
}

const BillSummaryPaid = ({ bill }: BillSummaryProps) => {
  return (
    <div className='Layer__bill-details__summary'>
      <div>
        <Text
          size={TextSize.sm}
          className='Layer__bill-details__summary__label'
        >
          Bill amount
        </Text>
        <Text
          weight={TextWeight.bold}
          size={TextSize.lg}
          className='Layer__bill-details__summary__value'
        >
          {convertNumberToCurrency(convertFromCents(bill.total_amount))}
        </Text>
      </div>
      <div>
        <Text
          size={TextSize.sm}
          className='Layer__bill-details__summary__label'
        >
          Status
        </Text>
        <Text
          weight={TextWeight.bold}
          size={TextSize.lg}
          status='success'
          className='Layer__bill-details__summary__value'
        >
          Paid
        </Text>
      </div>
      <div>
        <Text
          size={TextSize.sm}
          className='Layer__bill-details__summary__label'
        >
          Paid on
        </Text>
        <Text
          weight={TextWeight.bold}
          size={TextSize.lg}
          className='Layer__bill-details__summary__value'
        >
          {bill.paid_at ? formatDate(bill.paid_at, DATE_FORMAT_SHORT) : ''}
        </Text>
      </div>
    </div>
  )
}

const BillSummaryUnpaid = ({ bill }: BillSummaryProps) => {
  const difference: {
    text: string
    status?: TextStatus
  } = useMemo(() => {
    const d = parseISO(bill.due_at).setHours(0, 0, 0, 0)

    if (isNaN(d)) {
      return { text: '' }
    }

    const today = new Date().setHours(0, 0, 0, 0)
    const daysDiff = differenceInDays(today, d)

    if (daysDiff === 0) {
      return {
        text: 'Due today',
        status: 'warning',
      }
    }

    if (daysDiff > 0) {
      return {
        text: `${daysDiff} ${daysDiff === 1 ? 'day' : 'days'} overdue`,
        status: 'error',
      }
    }

    return {
      text: `Due in ${Math.abs(daysDiff)} ${Math.abs(daysDiff) === 1 ? 'day' : 'days'}`,
      status: daysDiff < 0 && daysDiff > -4 ? 'warning' : undefined,
    }
  }, [bill.due_at])

  return (
    <div className='Layer__bill-details__summary'>
      <div>
        <Text
          size={TextSize.sm}
          className='Layer__bill-details__summary__label'
        >
          Bill amount
        </Text>
        <Text
          weight={TextWeight.bold}
          size={TextSize.lg}
          className='Layer__bill-details__summary__value'
        >
          {convertNumberToCurrency(convertFromCents(bill.total_amount))}
        </Text>
      </div>
      <div>
        <Text
          size={TextSize.sm}
          className='Layer__bill-details__summary__label'
        >
          Open balance
        </Text>
        <Text
          weight={TextWeight.bold}
          size={TextSize.lg}
          status='error'
          className='Layer__bill-details__summary__value'
        >
          {convertNumberToCurrency(convertFromCents(bill.outstanding_balance))}
        </Text>
      </div>
      <div>
        <Text
          size={TextSize.sm}
          className='Layer__bill-details__summary__label'
        >
          Status
        </Text>
        <Text
          weight={TextWeight.bold}
          size={TextSize.lg}
          className='Layer__bill-details__summary__value'
          status={difference?.status}
        >
          {difference?.text}
        </Text>
      </div>
    </div>
  )
}

export const BillSummary = ({ bill }: BillSummaryProps) => {
  if (isBillPaid(bill.status)) {
    return <BillSummaryPaid bill={bill} />
  }

  return <BillSummaryUnpaid bill={bill} />
}
