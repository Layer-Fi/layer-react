import { useEffect, useState } from 'react'
import { useBillsContext, useBillsRecordPaymentContext } from '../../contexts/BillsContext'
import ChevronRight from '../../icons/ChevronRight'
import { Bill } from '../../types'
import { isBillPaid } from '../../utils/bills'
import { convertCentsToCurrency, formatDate } from '../../utils/format'
import { getVendorName } from '../../utils/vendors'
import { ButtonVariant } from '../Button/Button'
import { IconButton } from '../Button/IconButton'
import { SubmitAction, SubmitButton } from '../Button/SubmitButton'
import { DueStatus } from '../DueStatus/DueStatus'
import { Checkbox, CheckboxSize } from '../Input/Checkbox'
import { Text, TextSize } from '../Typography'
import { BillsTableStringOverrides } from './BillsTableWithPanel'
import classNames from 'classnames'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'

export const BillsList = ({
  stringOverrides,
}: {
  stringOverrides?: BillsTableStringOverrides
}) => {
  const { data } = useBillsContext()

  return (
    <ul className='Layer__bills-list'>
      {data.map((entry, idx) => (
        <BillsListItem
          index={idx}
          rowKey={`bills-row-${idx}`}
          key={`bills-list-item-${idx}`}
          bill={entry}
          stringOverrides={stringOverrides}
        />
      ))}
    </ul>
  )
}

const BillsListItem = ({
  index,
  bill,
  rowKey,
  stringOverrides,
}: {
  index: number
  bill: Bill
  rowKey: string
  stringOverrides?: BillsTableStringOverrides
}) => {
  const { setBillInDetails, status } = useBillsContext()

  const {
    billsToPay,
    addBill,
    removeBill,
    bulkSelectionActive,
    setShowRecordPaymentForm,
    vendor,
  } = useBillsRecordPaymentContext()

  const [showComponent, setShowComponent] = useState(false)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowComponent(true)
    }, index * 60)

    return () => clearTimeout(timeoutId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isSelected = Boolean(billsToPay.find(record => record.bill?.id === bill.id))
  const isSelectionDisabled = bulkSelectionActive && vendor && vendor?.id !== bill.vendor?.id

  const dataProps = toDataProperties({
    selected: isSelected,
    disabled: isSelectionDisabled,
  })

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && !isSelected) {
      addBill(bill)
    }
    else {
      removeBill(bill)
    }
  }

  const liClassName = classNames(
    'Layer__bills-list-item',
    showComponent ? 'Layer__bills-list-item--show' : '',
  )

  return (
    <li {...dataProps} className={liClassName}>
      <span
        data-status={bulkSelectionActive ? 'open' : 'closed'}
        className='Layer__bills-list-item__checkbox'
      >
        {status === 'UNPAID' && (
          <Checkbox
            boxSize={CheckboxSize.LARGE}
            checked={isSelected}
            onChange={e => handleCheckboxChange(e)}
            className='Layer__bills-table__checkbox'
            disabled={isSelectionDisabled}
          />
        )}
      </span>
      <span className='Layer__bills-list-item__content'>
        <span className='Layer__bills-list-item__topbar'>
          <span className='Layer__bills-list-item__topbar__date'>
            <Text as='span' size={TextSize.sm}>
              {formatDate(bill.due_at)}
            </Text>
            <span className='Layer__bills-list-item__topbar__separator' />
            <DueStatus
              dueDate={bill.due_at}
              paidAt={bill.paid_at}
              paid={isBillPaid(bill.status)}
              size='sm'
            />
          </span>
          <IconButton icon={<ChevronRight />} onClick={() => setBillInDetails(bill)} />
        </span>
        <span className='Layer__bills-list-item__main'>
          <Text size={TextSize.lg} ellipsis className='Layer__bills-list-item__main__vendor'>
            {getVendorName(bill.vendor)}
          </Text>
        </span>
        <span className='Layer__bills-list-item__bottombar'>
          <span className='Layer__bills-list-item__bottombar__amount'>
            {bill.total_amount !== bill.outstanding_balance
            && bill.outstanding_balance !== 0
              ? (
                <Text as='span' status='disabled'>
                  {convertCentsToCurrency(bill.total_amount - bill.outstanding_balance)}
                  {' '}
                  /
                  {' '}
                </Text>
              )
              : null}
            <Text as='span'>{convertCentsToCurrency(bill.total_amount)}</Text>
          </span>
          {status === 'UNPAID'
            ? (
              <SubmitButton
                onClick={(e) => {
                  e.stopPropagation()

                  if (billsToPay.map(x => x.bill?.id).includes(rowKey)) {
                    setShowRecordPaymentForm(false)
                  }
                  else {
                    addBill(bill)
                    setShowRecordPaymentForm(true)
                  }
                }}
                active={true}
                action={SubmitAction.UPDATE}
                variant={ButtonVariant.secondary}
              >
                {stringOverrides?.recordPaymentButtonText || 'Record payment'}
              </SubmitButton>
            )
            : null}
        </span>
      </span>
    </li>
  )
}
