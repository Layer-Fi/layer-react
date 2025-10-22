import { useBillsContext, useBillsRecordPaymentContext } from '../../contexts/BillsContext'
import ChevronRight from '../../icons/ChevronRight'
import type { Bill } from '../../types/bills'
import { convertCentsToCurrency, formatDate } from '../../utils/format'
import { getVendorName } from '../../utils/vendors'
import { ButtonVariant } from '../Button/Button'
import { IconButton } from '../Button/IconButton'
import { SubmitAction, SubmitButton } from '../Button/SubmitButton'
import { DueStatus } from '../DueStatus/DueStatus'
import { Checkbox } from '../ui/Checkbox/Checkbox'
import { Text, TextSize } from '../Typography'
import { BillsTableStringOverrides } from './BillsTableWithPanel'
import classNames from 'classnames'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'
import { DATE_FORMAT_SHORT } from '../../config/general'
import { Loader } from '../Loader/Loader'
import { useDelayedVisibility } from '../../hooks/visibility/useDelayedVisibility'

export const BillsList = ({
  stringOverrides,
}: {
  stringOverrides?: BillsTableStringOverrides
}) => {
  const { paginatedData: data, isLoading, error } = useBillsContext()

  if (isLoading && !error) {
    return <Loader />
  }

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
  const { openBillDetails, status } = useBillsContext()

  const {
    billsToPay,
    addBill,
    removeBill,
    bulkSelectionActive,
    setShowRecordPaymentForm,
    vendor,
  } = useBillsRecordPaymentContext()

  const { isVisible: showComponent } = useDelayedVisibility({ delay: index * 60 })

  const isSelected = Boolean(billsToPay.find(record => record.bill?.id === bill.id))
  const isSelectionDisabled = bulkSelectionActive && vendor && vendor?.id !== bill.vendor?.id

  const dataProps = toDataProperties({
    selected: isSelected,
    disabled: isSelectionDisabled,
    status: status.toLowerCase(),
  })

  const handleCheckboxChange = (value: boolean) => {
    if (value && !isSelected) {
      addBill(bill)
      return
    }

    removeBill(bill)
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
            variant='success'
            isSelected={isSelected}
            onChange={e => handleCheckboxChange(e)}
            className='Layer__bills-table__checkbox'
            isDisabled={isSelectionDisabled}
          />
        )}
      </span>
      <span className='Layer__bills-list-item__content'>
        <span className='Layer__bills-list-item__topbar'>
          <span className='Layer__bills-list-item__topbar__date'>
            <Text as='span' size={TextSize.sm}>
              {formatDate(bill.due_at, DATE_FORMAT_SHORT)}
            </Text>
            <span className='Layer__bills-list-item__separator' />
            <DueStatus
              dueDate={bill.due_at}
              paidAt={bill.paid_at}
              size='sm'
            />
          </span>
          <IconButton icon={<ChevronRight />} onClick={() => openBillDetails(bill)} />
        </span>
        <span className='Layer__bills-list-item__main'>
          <Text size={TextSize.lg} ellipsis className='Layer__bills-list-item__main__vendor'>
            {getVendorName(bill.vendor)}
          </Text>
          <span className='Layer__bills-list-item__main__amount'>
            <BillAmount bill={bill} />
          </span>
        </span>
        {bill.outstanding_balance !== 0 && (
          <span className='Layer__bills-list-item__bottombar'>
            <span className='Layer__bills-list-item__bottombar__amount'>
              <BillAmount bill={bill} />
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
        )}
      </span>
    </li>
  )
}

const BillAmount = ({ bill }: { bill: Bill }) => (
  <>
    {bill.outstanding_balance !== 0
      ? (
        <>
          <Text as='span' status='disabled'>
            {convertCentsToCurrency(bill.outstanding_balance)}
          </Text>
          <span className='Layer__bills-list-item__separator' />
        </>
      )
      : null}
    <Text as='span'>
      {convertCentsToCurrency(bill.total_amount)}
    </Text>
  </>
)
