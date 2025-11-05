import { HeaderCol } from '../Header/HeaderCol'
import { HeaderRow } from '../Header/HeaderRow'
import { RetryButton } from '../Button/RetryButton'
import { IconButton } from '../Button/IconButton'
import { CloseButton } from '../Button/CloseButton'
import { Button, ButtonVariant } from '../Button/Button'
import { FormEvent, useMemo } from 'react'
import { DATE_FORMAT_SHORT } from '../../config/general'
import { useBillsRecordPaymentContext } from '../../contexts/BillsContext'
import { Header } from '../Container'
import { DeprecatedDatePicker } from '../DeprecatedDatePicker/DeprecatedDatePicker'
import { InputGroup, Select } from '../Input'
import { StaticValue } from '../Input/StaticValue'
import { Heading, HeadingSize, TextSize, Text, ErrorText } from '../Typography'
import { Bill, BillPaymentMethod, BillPaymentMethods } from '../../types/bills'
import CloseIcon from '../../icons/CloseIcon'
import { parseISO, format as formatTime } from 'date-fns'
import { convertCentsToCurrency, convertFromCents, convertNumberToCurrency, convertToCents } from '../../utils/format'
import { getVendorName } from '../../utils/vendors'
import { AmountInput } from '../Input/AmountInput'
import { useUnpaidBillsByVendor } from './useUnpaidBillsByVendor'

const buildLabel = (bill: Bill, amount?: string | null) => {
  const amountNumber = amount !== undefined ? Number(amount) : 0
  const totalAmount = convertCentsToCurrency(bill.total_amount) ?? 0
  const currentAmount = convertNumberToCurrency(
    (convertFromCents(bill.outstanding_balance) ?? 0) - amountNumber,
  )

  return (
    <span className='Layer__bills__record-payment__select-label'>
      <span className='Layer__bills__record-payment__select-label__date'>
        {formatTime(parseISO(bill.due_at), DATE_FORMAT_SHORT)}
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

export type BillsRecordPaymentStringOverrides = {
  header?: string
}

export const BillsRecordPayment = ({
  stringOverrides,
}: {
  stringOverrides?: BillsRecordPaymentStringOverrides
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
    paymentMethod,
    setPaymentMethod,
    vendor,
    isLoading,
    apiError,
  } = useBillsRecordPaymentContext()
  const { data: rawAvailableBills } = useUnpaidBillsByVendor({ vendorId: vendor?.id })

  const availableBills = useMemo(() =>
    rawAvailableBills?.filter(b => !billsToPay.find(x => x.bill?.id === b.id)),
  [rawAvailableBills, billsToPay])

  const totalAmount = billsToPay.reduce((acc, record) =>
    acc + (record.amount !== undefined ? Number(record.amount) : 0), 0)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    void recordPayment()
  }

  const paymentMethodOptions = Object.entries(BillPaymentMethods).map(([key, value]) => ({
    label: value,
    value: key,
  }))

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
            <DeprecatedDatePicker
              selected={paymentDate}
              onChange={date => setPaymentDate(date as Date)}
              displayMode='dayPicker'
            />
          </InputGroup>

          <InputGroup
            label='Payment date'
            className='Layer__bills__record-payment__date'
            inline={true}
          >
            <Select
              className='Layer__bills__record-payment__method'
              options={paymentMethodOptions}
              value={paymentMethodOptions.find(option => option.value === paymentMethod)}
              onChange={(option) => {
                if (option.value) {
                  setPaymentMethod(option.value as BillPaymentMethod)
                }
              }}
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

          <div className='Layer__bills__record-payment__amount-rows'>
            {billsToPay.map((record, index) => (
              <div key={index} className='Layer__bills__record-payment__amount-row'>
                <InputGroup inline={true}>
                  <Select
                    options={availableBills?.map(b => ({
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
                    value={record.amount === null ? undefined : record.amount}
                    onChange={value => setAmountByIndex(index, value === undefined ? null : value)}
                    onBlur={() => {
                      if (record.amount && record.bill?.outstanding_balance) {
                        const amount = convertToCents(record.amount)
                        if (amount && amount > record.bill?.outstanding_balance)
                          setAmountByIndex(
                            index,
                            convertFromCents(record.bill?.outstanding_balance ?? 0)?.toString(),
                          )
                      }
                    }}
                  />
                </InputGroup>
                <IconButton
                  type='button'
                  icon={<CloseIcon />}
                  onClick={() => removeBillByIndex(index)}
                />
              </div>
            ))}
          </div>

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
            {apiError
              ? (
                <>
                  <RetryButton
                    type='submit'
                    disabled={isLoading || totalAmount === 0}
                    error='Something went wrong, try again'
                  >
                    Retry
                  </RetryButton>
                  <ErrorText>
                    Something went wrong, please try again.
                  </ErrorText>
                </>
              )
              : (
                <Button
                  className='Layer__bills__record-payment__submit'
                  type='submit'
                  disabled={isLoading || totalAmount === 0}
                >
                  Record payment
                </Button>
              )}
          </div>
        </div>
      </form>
    </div>
  )
}
