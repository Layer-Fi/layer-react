import { InputGroup } from '../Input/InputGroup'
import { HeaderCol } from '../Header/HeaderCol'
import { HeaderRow } from '../Header/HeaderRow'
import { CloseButton } from '../Button/CloseButton'
import { Button, ButtonVariant } from '../Button/Button'
import { useMemo } from 'react'
import { useBillsRecordPaymentContext } from '../../contexts/BillsContext'
import Check from '../../icons/Check'
import { Header } from '../Container/Header'
import { StaticValue } from '../Input/StaticValue'
import { Heading, HeadingSize, Text, TextSize } from '../Typography'
import { getVendorName } from '../../utils/vendors'
import { convertCentsToCurrency, convertNumberToCurrency, formatDate } from '../../utils/format'
import { isBillPaid } from '../../utils/bills'

export const BillsPaymentRecorded = ({
  stringOverrides,
}: {
  stringOverrides?: {
    header?: string
  }
}) => {
  const {
    billsToPay,
    closeRecordPayment,
    paymentDate,
    vendor,
    payRemainingBalance,
  } = useBillsRecordPaymentContext()

  const totalPaid = useMemo(() => billsToPay.reduce((acc, record) =>
    acc + (record.amount !== undefined ? Number(record.amount) : 0), 0),
  [billsToPay])

  const anyUnpaid = useMemo(() =>
    billsToPay.some(record => record.bill?.status !== 'PAID'),
  [billsToPay])

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
            <CloseButton type='button' onClick={closeRecordPayment} />
          </HeaderCol>
        </HeaderRow>
      </Header>
      <div className='Layer__bills__payment-recorded__content'>
        <div className='Layer__bills__payment-recorded__summary'>
          <InputGroup inline={true} label='Vendor'>
            <StaticValue>{getVendorName(vendor)}</StaticValue>
          </InputGroup>
          <InputGroup inline={true} label='Payment date'>
            <StaticValue>{formatDate(paymentDate)}</StaticValue>
          </InputGroup>
          <InputGroup inline={true} label='Total paid'>
            <StaticValue>{convertNumberToCurrency(totalPaid)}</StaticValue>
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
              <th />
            </tr>
          </thead>
          <tbody>
            {billsToPay.map((record, index) => (
              <tr
                key={index}
                className='Layer__bills__payment-recorded__bill-row'
              >
                <td>
                  <Text>{formatDate(record.bill?.due_at)}</Text>
                </td>
                <td>
                  <Text className='Layer__bills__payment-recorded__amount-paid-col'>
                    {convertNumberToCurrency(Number(record.amount))}
                  </Text>
                </td>
                <td className='Layer__bills__payment-recorded__open-balance-col'>
                  <Text as='span' status={isBillPaid(record.bill?.status) ? 'success' : 'error'}>
                    {convertCentsToCurrency(record.bill?.outstanding_balance)}
                  </Text>
                </td>
                <td className='Layer__bills__payment-recorded__paid-icon-col'>
                  {record.bill?.status === 'PAID' && <Check size={18} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {anyUnpaid && (
          <div className='Layer__bills__payment-recorded__submit-container'>
            <Button
              variant={ButtonVariant.secondary}
              className='Layer__bills__payment-recorded__record-balance'
              onClick={payRemainingBalance}
            >
              Record remaining balance
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
