import type { Bill } from '../../types/bills'
import { convertFromCents, convertNumberToCurrency, formatDate } from '../../utils/format'
import { Text, TextSize, TextWeight } from '../Typography/Text'
import { DATE_FORMAT_SHORT } from '../../config/general'

type BillSummaryPaidProps = {
  bill: Bill
}

export const BillSummaryPaid = ({ bill }: BillSummaryPaidProps) => {
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
