import React, { useState } from 'react'
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
import { InputGroup, Input, StaticValue, Select } from '../Input'
import { JournalFormStringOverrides } from '../JournalForm/JournalForm'
import { Heading, HeadingSize, TextSize, Text } from '../Typography'
import { Bill } from '../../hooks/useBills'
import CloseIcon from '../../icons/CloseIcon'

const buildLabel = (bill: Bill, amount?: number) => {
  return (
    <span className='Layer__bills__record-payment__select-label'>
      <span className='Layer__bills__record-payment__select-label__date'>
        {bill.dueDate}
      </span>
      <span className='Layer__bills__record-payment__select-label__value'>
        <span className='Layer__bills__record-payment__select-label__bill-amount'>
          {bill.billAmount}
          /
        </span>
        {(bill.openBalance ?? 0) + (amount ?? 0)}
      </span>
    </span>
  )
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
    setShowRecordPaymentForm,
    removeBillByIndex,
  } = useBillsRecordPaymentContext()
  /** @TODO - we don't want to use all bills here, another API call to get all bills by vendor? */
  const { data } = useBillsContext()
  const [paymentDate, setPaymentDate] = useState(new Date())

  const totalAmount = billsToPay.reduce((acc, record) => acc + (record.amount ?? 0), 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    /** @TODO - call API */
  }

  return (
    <div className='Layer__bills__record-payment' onSubmit={handleSubmit}>
      <Header className='Layer__bills__sidebar__header'>
        <HeaderRow>
          <HeaderCol>
            <Heading size={HeadingSize.secondary} className='title'>
              {stringOverrides?.header ?? 'Record payment'}
            </Heading>
          </HeaderCol>
          <HeaderCol className='actions'>
            <CloseButton onClick={() => setShowRecordPaymentForm(false)} />
          </HeaderCol>
        </HeaderRow>
      </Header>

      <form className='Layer__form'>
        <div className='Layer__bills__record-payment__base-details'>
          <InputGroup
            label='Vendor'
            className='Layer__bills__record-payment__vendor'
            inline={true}
          >
            <StaticValue>PG&E</StaticValue>
          </InputGroup>

          <InputGroup
            label='Payment date'
            className='Layer__bills__record-payment__date'
            inline={true}
          >
            <DatePicker
              selected={paymentDate}
              onChange={date => setPaymentDate(date as Date)}
              mode='dayPicker'
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
                  options={data.map(b => ({
                    label: buildLabel(
                      b,
                      billsToPay.find(x => x.bill?.id === b.id)?.amount ?? 0,
                    ),
                    value: b,
                  }))}
                  value={record.bill && {
                    label: buildLabel(
                      record.bill,
                      billsToPay.find(x => x.bill?.id === record.bill?.id)?.amount ?? 0,
                    ),
                    value: record.bill,
                  }}
                  onChange={(option) => {
                    if (option.value) {
                      setBill(option.value, index)
                    }
                  }}
                />
                {/** @TODO - use AmountInput from another PR  */}
                <Input
                  type='number'
                  value={record.amount}
                  onChange={e =>
                    setAmountByIndex(index, Number((e.target as HTMLInputElement).value))}
                />
              </InputGroup>
              <IconButton
                icon={<CloseIcon />}
                onClick={() => removeBillByIndex(index)}
              />
            </div>
          ))}

          <Button
            variant={ButtonVariant.secondary}
            className='Layer__bills__record-payment__add-bill'
            onClick={() => addBill()}
          >
            Add bill
          </Button>

          <div className='Layer__bills__record-payment__total'>
            <Text size={TextSize.md}>Total</Text>
            <Text size={TextSize.md}>
              $
              {totalAmount}
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
