import React, { useContext, useState } from 'react'
import { BillsContext } from '../../contexts/BillsContext'
import {
  Button,
  ButtonVariant,
  CloseButton,
} from '../Button'
import { Header } from '../Container'
import { DatePicker } from '../DatePicker'
import { HeaderRow, HeaderCol } from '../Header'
import { InputGroup, Input, StaticValue } from '../Input'
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
    <div className='Layer__bills__record-payment' onSubmit={handleSubmit}>
      <Header className='Layer__bills__sidebar__header'>
        <HeaderRow>
          <HeaderCol>
            <Heading size={HeadingSize.secondary} className='title'>
              {stringOverrides?.header ?? 'Record payment'}
            </Heading>
          </HeaderCol>
          <HeaderCol className='actions'>
            <CloseButton onClick={() => closeSelectedEntry()} />
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

          <div className='Layer__bills__record-payment__amount-row'>
            <InputGroup inline={true}>
              <Input
                type='number'
                value={amount}
                onChange={e =>
                  setAmount(Number((e.target as HTMLInputElement).value))}
              />
              <Input
                type='number'
                value={amount}
                onChange={e =>
                  setAmount(Number((e.target as HTMLInputElement).value))}
              />
            </InputGroup>
          </div>

          <Button
            variant={ButtonVariant.secondary}
            className='Layer__bills__record-payment__add-bill'
          >
            Add bill
          </Button>

          <div className='Layer__bills__record-payment__total'>
            <Text size={TextSize.md}>Total</Text>
            <Text size={TextSize.md}>
              $
              {amount.toFixed(2)}
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
