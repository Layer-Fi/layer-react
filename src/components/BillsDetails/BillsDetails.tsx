import React, { useContext } from 'react'
import { BillsContext } from '../../contexts/BillsContext'
import { BackButton } from '../Button'
import { Header } from '../Container'
import { DatePicker } from '../DatePicker/DatePicker'
import { HeaderRow, HeaderCol } from '../Header'
import { Input } from '../Input'
import { Checkbox } from '../Input/Checkbox'
import { Select } from '../Input/Select'
import { Textarea } from '../Textarea'
import { TextWeight, TextSize, Text } from '../Typography'
import classNames from 'classnames'

export const BillsDetails = ({
  billDetailsId,
}: {
  billDetailsId: string | undefined
}) => {
  const { closeBillDetails } = useContext(BillsContext)
  const baseClassName = classNames(
    'Layer__bills-account__index',
    billDetailsId && 'open',
  )

  // Simple Tag component
  const Tag = ({ children }: { children: React.ReactNode }) => (
    <div className='Layer__tag'>{children}</div>
  )

  return (
    <div className={baseClassName}>
      <Header className='Layer__bills-account__header'>
        <HeaderRow>
          <HeaderCol style={{ padding: 0 }}>
            <BackButton onClick={() => closeBillDetails()} />
            <div className='Layer__bills-account__title-container'>
              <Text
                weight={TextWeight.bold}
                className='Layer__bills-account__title'
              >
                Bill details
              </Text>
              <Text size={TextSize.sm}>PG&E 08/01/2024</Text>
            </div>
          </HeaderCol>
        </HeaderRow>
      </Header>

      <div className='Layer__bill-details__content'>
        <div className='Layer__bill-details__summary'>
          <div>
            <Text size={TextSize.sm}>Bill amount</Text>
            <Text weight={TextWeight.bold} size={TextSize.lg}>
              $86.44
            </Text>
          </div>
          <div>
            <Text size={TextSize.sm}>Status</Text>
            <Text>Paid</Text>
          </div>
          <div>
            <Text size={TextSize.sm}>Paid on</Text>
            <Text>08/01/2024</Text>
          </div>
        </div>

        <div className='Layer__bill-details__form'>
          <div className='Layer__bill-details__form-row'>
            <label>
              <Text size={TextSize.sm}>Vendor</Text>
              <Select
                value='PG&E'
                options={[{ options: ['PG&E'], label: 'PG&E' }]}
                onChange={() => {}}
              />
            </label>
          </div>

          <div className='Layer__bill-details__form-row'>
            <label>
              <Text size={TextSize.sm}>Address</Text>
              <Textarea
                value={`Jenny Robertson
Robertson & Associates
P.O. Box 147
Bayshore, CA 94326`}
              />
            </label>
          </div>

          <div className='Layer__bill-details__form-row Layer__bill-details__form-row--split'>
            <label>
              <Text size={TextSize.sm}>Terms</Text>
              <Select
                value='Due on receipt'
                options={[
                  { options: ['Due on receipt'], label: 'Due on receipt' },
                ]}
                onChange={() => {}}
              />
            </label>
            <label>
              <Text size={TextSize.sm}>Bill no.</Text>
              <Input value='2' />
            </label>
          </div>

          <div className='Layer__bill-details__form-row Layer__bill-details__form-row--split'>
            <label>
              <Text size={TextSize.sm}>Bill date</Text>
              <DatePicker
                mode='dayPicker'
                selected={new Date('2024-08-01')}
                onChange={() => {}}
                dateFormat='MM/dd/yyyy'
              />
            </label>
            <label>
              <Text size={TextSize.sm}>Due date</Text>
              <DatePicker
                mode='dayPicker'
                selected={new Date('2024-08-01')}
                onChange={() => {}}
                dateFormat='MM/dd/yyyy'
              />
            </label>
          </div>

          <div className='Layer__bill-details__form-row'>
            <Tag>Add tag</Tag>
          </div>

          <div className='Layer__bill-details__form-row'>
            <Text weight={TextWeight.bold}>Category details</Text>
          </div>

          <div className='Layer__bill-details__category-row'>
            <Select
              value='Legal & Professional Fees:Acco...'
              options={[
                {
                  label: 'Legal & Professional Fees',
                  options: ['Legal & Professional Fees:Acco...'],
                },
              ]}
              onChange={() => {}}
            />
            <Input value='$ 26.44' />
            <Input placeholder='Description' />
            <Tag>Add tag</Tag>
            <Checkbox checked label='Tax' />
            <Text>Billable</Text>
          </div>

          <div className='Layer__bill-details__category-row'>
            <Select
              value='Legal & Professional Fees:Acco...'
              options={[
                {
                  label: 'Legal & Professional Fees',
                  options: ['Legal & Professional Fees:Acco...'],
                },
              ]}
              onChange={() => {}}
            />
            <Input value='$ 26.44' />
            <Input placeholder='Description' />
            <Tag>Add tag</Tag>
            <Checkbox checked label='Tax' />
            <Text>Billable</Text>
          </div>
        </div>
      </div>
    </div>
  )
}
