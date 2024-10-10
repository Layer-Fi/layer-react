import React, { useContext, useState } from 'react'
import { BillsContext } from '../../contexts/BillsContext'
import CloseIcon from '../../icons/CloseIcon'
import { Button, ButtonVariant, IconButton, SubmitButton } from '../Button'
import { Header } from '../Container'
import { DatePicker } from '../DatePicker'
import { HeaderRow, HeaderCol } from '../Header'
import { InputGroup, Input } from '../Input'
import { JournalFormStringOverrides } from '../JournalForm/JournalForm'
import { Heading, HeadingSize, TextSize, Text } from '../Typography'

export const BillsRecordPayment = ({
  stringOverrides,
  setPaymentRecorded,
}: {
  stringOverrides?: JournalFormStringOverrides
  setPaymentRecorded: (paymentRecorded: boolean) => void
}) => {
  const { closeSelectedEntry, selectedEntryId } = useContext(BillsContext)
  const [paymentDate, setPaymentDate] = useState(new Date())
  const [amount, setAmount] = useState(80)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPaymentRecorded(true)
  }

  return (
    <form
      className='Layer__form Layer__bills__record-payment'
      onSubmit={handleSubmit}
    >
      <Header className='Layer__bills__sidebar__header'>
        <HeaderRow>
          <HeaderCol>
            <Heading size={HeadingSize.secondary} className='title'>
              {stringOverrides?.header ?? 'Record payment'}
            </Heading>
          </HeaderCol>
          <HeaderCol className='actions'>
            <IconButton
              type='button'
              onClick={() => closeSelectedEntry()}
              icon={<CloseIcon size={18} />}
            />
          </HeaderCol>
        </HeaderRow>
      </Header>

      <div className='Layer__bills__record-payment__content'>
        <InputGroup
          label='Vendor'
          className='Layer__bills__record-payment__vendor'
        >
          <Text>PG&E</Text>
        </InputGroup>

        <InputGroup
          label='Payment date'
          className='Layer__bills__record-payment__date'
        >
          <DatePicker
            selected={paymentDate}
            onChange={date => setPaymentDate(date as Date)}
            mode='dayPicker'
          />
        </InputGroup>

        <Heading
          size={HeadingSize.secondary}
          className='Layer__bills__record-payment__amount-header'
        >
          Add amount
        </Heading>

        <div className='Layer__bills__record-payment__amount-row'>
          <InputGroup label='08/01/2024'>
            <Input
              type='number'
              value={amount}
              onChange={e =>
                setAmount(Number((e.target as HTMLInputElement).value))
              }
            />
          </InputGroup>
          <Text
            size={TextSize.md}
            className='Layer__bills__record-payment__amount-display'
          >
            ${amount.toFixed(2)}
          </Text>
        </div>

        <Button
          variant={ButtonVariant.secondary}
          className='Layer__bills__record-payment__add-bill'
        >
          Add bill
        </Button>

        <div className='Layer__bills__record-payment__total'>
          <Text size={TextSize.md}>Total</Text>
          <Text size={TextSize.md}>${amount.toFixed(2)}</Text>
        </div>

        <SubmitButton className='Layer__bills__record-payment__submit'>
          Record payment
        </SubmitButton>
      </div>
    </form>
  )
}
