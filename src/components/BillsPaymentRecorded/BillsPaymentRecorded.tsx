import React, { useContext } from 'react'
import { BillsContext } from '../../contexts/BillsContext'
import Check from '../../icons/Check'
import CloseIcon from '../../icons/CloseIcon'
import { IconButton, Button } from '../Button'
import { Header } from '../Container'
import { HeaderRow, HeaderCol } from '../Header'
import { Input } from '../Input'
import { Heading, HeadingSize, Text } from '../Typography'

export const BillsPaymentRecorded = ({
  stringOverrides,
}: {
  stringOverrides?: {
    header?: string
  }
}) => {
  const { closeSelectedEntry } = useContext(BillsContext)

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
            <IconButton
              type='button'
              onClick={() => closeSelectedEntry()}
              icon={<CloseIcon size={18} />}
            />
          </HeaderCol>
        </HeaderRow>
      </Header>
      <div className='Layer__bills__payment-recorded__content'>
        <div className='Layer__bills__payment-recorded__summary'>
          <div>
            <Text>Vendor</Text>
            <Text>{paymentDetails.vendor}</Text>
          </div>
          <div>
            <Text>Payment date</Text>
            <Text>{paymentDetails.paymentDate}</Text>
          </div>
          <div>
            <Text>Total paid</Text>
            <Text>{paymentDetails.totalPaid}</Text>
          </div>
        </div>
        <Heading size={HeadingSize.secondary}>Bills paid</Heading>
        <div className='Layer__bills__payment-recorded__bills-list'>
          <div className='Layer__bills__payment-recorded__bill-header'>
            <Text>Bill date</Text>
            <Text>Amount paid now</Text>
            <Text>Open balance</Text>
          </div>
          {paymentDetails.billsPaid.map((bill, index) => (
            <div
              key={index}
              className='Layer__bills__payment-recorded__bill-row'
            >
              <Text>{bill.date}</Text>
              <Text>{bill.amountPaid}</Text>
              <Text className={bill.isPaid ? 'paid' : 'unpaid'}>
                {bill.openBalance}
              </Text>
              {bill.isPaid && <Check size={18} className='paid-icon' />}
            </div>
          ))}
        </div>
        <Button className='Layer__bills__payment-recorded__record-balance'>
          Record remaining balance
        </Button>
      </div>
    </div>
  )
}
