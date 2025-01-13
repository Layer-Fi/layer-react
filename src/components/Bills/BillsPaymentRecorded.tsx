import React from 'react'
import { useBillsRecordPaymentContext } from '../../contexts/BillsContext'
import Check from '../../icons/Check'
import { Button, ButtonVariant, CloseButton } from '../Button'
import { Header } from '../Container'
import { HeaderRow, HeaderCol } from '../Header'
import { InputGroup, StaticValue } from '../Input'
import { Heading, HeadingSize, Text, TextSize } from '../Typography'

export const BillsPaymentRecorded = ({
  stringOverrides,
}: {
  stringOverrides?: {
    header?: string
  }
}) => {
  const { setShowRecordPaymentForm } = useBillsRecordPaymentContext()

  // Mock data - replace with actual data from your context or props
  const paymentDetails = {
    vendor: 'PG&E',
    paymentDate: 'Nov 5, 2023',
    totalPaid: '$172.88',
    billsPaid: [
      {
        date: '08/01/2024',
        amountPaid: '$86.44',
        openBalance: '$0.00',
        isPaid: true,
      },
      {
        date: '08/01/2024',
        amountPaid: '$86.44',
        openBalance: '$10.00',
        isPaid: false,
      },
      {
        date: '07/14/2024',
        amountPaid: '$10.00',
        openBalance: '$0.00',
        isPaid: true,
      },
    ],
  }

  return (
    <div className='Layer__bills__payment-recorded'>
      <Header className='Layer__bills__sidebar__header'>
        <HeaderRow>
          <HeaderCol>
            <Heading size={HeadingSize.secondary} className='title'>
              {stringOverrides?.header ?? 'Payment recorded'}
            </Heading>
          </HeaderCol>
          <HeaderCol className='actions'>
            <CloseButton type='button' onClick={() => setShowRecordPaymentForm(false)} />
          </HeaderCol>
        </HeaderRow>
      </Header>
      <div className='Layer__bills__payment-recorded__content'>
        <div className='Layer__bills__payment-recorded__summary'>
          <InputGroup inline={true} label='Vendor'>
            <StaticValue>{paymentDetails.vendor}</StaticValue>
          </InputGroup>
          <InputGroup inline={true} label='Payment date'>
            <StaticValue>{paymentDetails.paymentDate}</StaticValue>
          </InputGroup>
          <InputGroup inline={true} label='Total paid'>
            <StaticValue>{paymentDetails.totalPaid}</StaticValue>
          </InputGroup>
        </div>
      </div>
      <div className='Layer__bills__payment-recorded__bills'>
        <Text size={TextSize.sm}>Bills paid</Text>
        <table className='Layer__bills__payment-recorded__bills-table'>
          <thead>
            <tr>
              <th>
                <Text size={TextSize.sm}>Bill date</Text>
              </th>
              <th>
                <Text size={TextSize.sm}>Amount paid now</Text>
              </th>
              <th className='Layer__bills__payment-recorded__open-balance-col'>
                <Text size={TextSize.sm}>Open balance</Text>
              </th>
            </tr>
          </thead>
          <tbody>
            {paymentDetails.billsPaid.map((bill, index) => (
              <tr
                key={index}
                className='Layer__bills__payment-recorded__bill-row'
              >
                <td>
                  <Text>{bill.date}</Text>
                </td>
                <td>
                  <Text className='Layer__bills__payment-recorded__amount-paid-col'>
                    {bill.amountPaid}
                  </Text>
                </td>
                <td className='Layer__bills__payment-recorded__open-balance-col'>
                  <Text className={bill.isPaid ? 'paid' : 'unpaid'}>
                    {bill.openBalance}
                  </Text>
                </td>
                <td>
                  {bill.isPaid && <Check size={18} className='paid-icon' />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className='Layer__bills__payment-recorded__submit-container'>
          <Button
            variant={ButtonVariant.secondary}
            className='Layer__bills__payment-recorded__record-balance'
          >
            Record remaining balance
          </Button>
        </div>
      </div>
    </div>
  )
}
