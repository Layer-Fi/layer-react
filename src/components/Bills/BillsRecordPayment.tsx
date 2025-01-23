import { useMemo } from 'react'
import { DATE_FORMAT } from '../../config/general'
import { useBillsContext, useBillsRecordPaymentContext } from '../../contexts/BillsContext'
import {
  Button,
  ButtonVariant,
  CloseButton,
  IconButton,
} from '../Button'
import { Header } from '../Container'
import { DatePicker } from '../DatePicker'
import { HeaderRow, HeaderCol } from '../Header'
import { InputGroup, StaticValue, Select } from '../Input'
import { JournalFormStringOverrides } from '../JournalForm/JournalForm'
import { Heading, HeadingSize, TextSize, Text } from '../Typography'
import { Bill } from '../../types/bills'
import CloseIcon from '../../icons/CloseIcon'
import { parseISO, format as formatTime } from 'date-fns'
import { convertNumberToCurrency } from '../../utils/format'
import { getVendorName } from '../../utils/vendors'
import { AmountInput } from '../Input/AmountInput'
import { BillsRecordPaymentFormRecord } from '../../hooks/useBillsRecordPayment'

/** @TODO - temp - remove after rebase */
const convertFromCents = (amount: number) => {
  return amount / 100
}

const buildLabel = (bill: Bill, amount?: string) => {
  const amountNumber = amount !== undefined ? Number(amount) : 0
  const totalAmount = convertNumberToCurrency(convertFromCents(bill.total_amount))
  const currentAmount = convertNumberToCurrency(
    convertFromCents((bill.outstanding_balance ?? 0)) + amountNumber,
  )

  return (
    <span className='Layer__bills__record-payment__select-label'>
      <span className='Layer__bills__record-payment__select-label__date'>
        {formatTime(parseISO(bill.due_at), DATE_FORMAT)}
      </span>
      <span className='Layer__bills__record-payment__select-label__value'>
        <span className='Layer__bills__record-payment__select-label__bill-amount'>
          {currentAmount}
          /
        </span>
        {totalAmount}
      </span>
    </span>
  )
}

const getAvailableBills = (
  data: Bill[],
  billsToPay: BillsRecordPaymentFormRecord[],
  vendorId?: string,
) => {
  return data.filter(b => (
    b.status !== 'PAID'
    && !billsToPay.find(x => x.bill?.id === b.id)
    && (vendorId ? b.vendor?.id === vendorId : true)
  ))
}

export const BillsRecordPayment = ({
  stringOverrides,
}: {
  stringOverrides?: JournalFormStringOverrides
}) => {
  const {
    billsToPay,
    addBill,
    setBill,
    setAmountByIndex,
    removeBillByIndex,
    recordPayment,
    closeRecordPayment,
    paymentDate,
    setPaymentDate,
    vendor,
  } = useBillsRecordPaymentContext()
  const { data } = useBillsContext()
  const availableBills = useMemo(() =>
    getAvailableBills(data, billsToPay, vendor?.id),
  [data, billsToPay, vendor])

  const totalAmount = billsToPay.reduce((acc, record) =>
    acc + (record.amount !== undefined ? Number(record.amount) : 0), 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void recordPayment()
  }

  return (
    <div className='Layer__bills__record-payment'>
      <Header className='Layer__bills__sidebar__header'>
        <HeaderRow>
          <HeaderCol>
            <Heading size={HeadingSize.secondary} className='title'>
              {stringOverrides?.header ?? 'Record payment'}
            </Heading>
          </HeaderCol>
          <HeaderCol className='actions'>
            <CloseButton type='button' onClick={closeRecordPayment} />
          </HeaderCol>
        </HeaderRow>
      </Header>

      <form className='Layer__form' onSubmit={handleSubmit}>
        <div className='Layer__bills__record-payment__base-details'>
          <InputGroup
            label='Vendor'
            className='Layer__bills__record-payment__vendor'
            inline={true}
          >
            <StaticValue>{vendor && getVendorName(vendor)}</StaticValue>
          </InputGroup>

          <InputGroup
            label='Payment date'
            className='Layer__bills__record-payment__date'
            inline={true}
          >
            <DatePicker
              selected={paymentDate}
              onChange={date => setPaymentDate(date as Date)}
              displayMode='dayPicker'
            />
          </InputGroup>
        </div>

        <div className='Layer__bills__record-payment__amount'>
          <Heading
            size={HeadingSize.secondary}
            className='Layer__bills__record-payment__amount-header'
          >
            Add amount
          </Heading>
          {billsToPay.map((record, index) => (
            <div key={index} className='Layer__bills__record-payment__amount-row'>
              <InputGroup inline={true}>
                <Select
                  options={availableBills.map(b => ({
                    label: buildLabel(
                      b,
                      billsToPay.find(x => x.bill?.id === b.id)?.amount,
                    ),
                    value: b,
                  }))}
                  value={record.bill && {
                    label: buildLabel(
                      record.bill,
                      billsToPay.find(x => x.bill?.id === record.bill?.id)?.amount,
                    ),
                    value: record.bill,
                  }}
                  onChange={(option) => {
                    if (option.value) {
                      setBill(option.value, index)
                    }
                  }}
                />
                <AmountInput
                  value={record.amount}
                  onChange={value => setAmountByIndex(index, value)}
                />
              </InputGroup>
              <IconButton
                icon={<CloseIcon />}
                onClick={() => removeBillByIndex(index)}
              />
            </div>
          ))}

          <Button
            type='button'
            variant={ButtonVariant.secondary}
            className='Layer__bills__record-payment__add-bill'
            onClick={() => addBill()}
          >
            Add bill
          </Button>

          <div className='Layer__bills__record-payment__total'>
            <Text size={TextSize.md}>Total</Text>
            <Text size={TextSize.md}>
              {convertNumberToCurrency(totalAmount)}
            </Text>
          </div>

          <div className='Layer__bills__record-payment__submit-container'>
            <Button
              className='Layer__bills__record-payment__submit'
              type='submit'
            >
              Record payment
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
