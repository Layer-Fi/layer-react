import React, { useContext } from 'react'
import { BillsContext } from '../../contexts/BillsContext'
import { BackButton, Button, ButtonVariant } from '../Button'
import { DatePicker } from '../DatePicker/DatePicker'
import { Header, HeaderRow, HeaderCol } from '../Header'
import { Input, InputGroup } from '../Input'
import { Checkbox, CheckboxVariant } from '../Input/Checkbox'
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

  return (
    <div className={baseClassName}>
      <Header className='Layer__bills-account__header'>
        <HeaderRow>
          <HeaderCol>
            <BackButton onClick={() => closeBillDetails()} />
            <div className='Layer__bills-account__title-container'>
              <Text
                weight={TextWeight.bold}
                className='Layer__bills-account__title'
              >
                Bill details
              </Text>
              <Text
                size={TextSize.sm}
                className='Layer__bills-account__header__date'
              >
                PG&E 08/01/2024
              </Text>
            </div>
          </HeaderCol>
        </HeaderRow>
      </Header>

      <div className='Layer__bill-details__content'>
        <div className='Layer__bill-details__section Layer__bill-details__head'>
          <div className='Layer__bill-details__summary'>
            <div>
              <Text
                size={TextSize.sm}
                className='Layer__bill-details__summary__label'
              >
                Bill amount
              </Text>
              <Text
                weight={TextWeight.bold}
                size={TextSize.lg}
                className='Layer__bill-details__summary__value'
              >
                $86.44
              </Text>
            </div>
            <div>
              <Text
                size={TextSize.sm}
                className='Layer__bill-details__summary__label'
              >
                Status
              </Text>
              <Text
                weight={TextWeight.bold}
                size={TextSize.lg}
                className='Layer__bill-details__summary__value'
              >
                Paid
              </Text>
            </div>
            <div>
              <Text
                size={TextSize.sm}
                className='Layer__bill-details__summary__label'
              >
                Paid on
              </Text>
              <Text
                weight={TextWeight.bold}
                size={TextSize.lg}
                className='Layer__bill-details__summary__value'
              >
                08/01/2024
              </Text>
            </div>
          </div>
          <div className='Layer__bill-details__action'>
            <Button onClick={() => console.log('Record payment')}>
              Record payment
            </Button>
          </div>
        </div>

        <div className='Layer__bill-details__section'>
          <div className='Layer__bill-details__form-row'>
            <div className='Layer__bill-details__form-col'>
              <InputGroup inline={true} label='Vendor'>
                <Select
                  value='PG&E'
                  options={[{ options: ['PG&E'], label: 'PG&E' }]}
                  onChange={() => {}}
                />
              </InputGroup>
              <InputGroup inline={true} label='Adress'>
                <Textarea
                  value={`Jenny Robertson
Robertson & Associates
P.O. Box 147
Bayshore, CA 94326`}
                />
              </InputGroup>
            </div>
          </div>

          <div className='Layer__bill-details__form-row'>
            <div className='Layer__bill-details__form-col'>
              <InputGroup inline={true} label='Terms'>
                <Select
                  value='Due on receipt'
                  options={[
                    { options: ['Due on receipt'], label: 'Due on receipt' },
                  ]}
                  onChange={() => {}}
                />
              </InputGroup>
              <InputGroup inline={true} label='Bill date'>
                <DatePicker
                  mode='dayPicker'
                  selected={new Date('2024-08-01')}
                  onChange={() => {}}
                  dateFormat='MM/dd/yyyy'
                />
              </InputGroup>
            </div>
            <div className='Layer__bill-details__form-col'>
              <InputGroup inline={true} label='Bill no.'>
                <Input value='2' />
              </InputGroup>
              <InputGroup inline={true} label='Due date'>
                <DatePicker
                  mode='dayPicker'
                  selected={new Date('2024-08-01')}
                  onChange={() => {}}
                  dateFormat='MM/dd/yyyy'
                />
              </InputGroup>
            </div>
          </div>
        </div>

        <div className='Layer__bill-details__section Layer__bill-details__section--category-details'>
          <div className='Layer__bill-details__form-row'>
            <Text weight={TextWeight.bold} size={TextSize.sm}>
              Category details
            </Text>
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
            <Checkbox label='Tax' variant={CheckboxVariant.DARK} />
            <Checkbox checked label='Billable' variant={CheckboxVariant.DARK} />
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
            <Checkbox checked label='Tax' variant={CheckboxVariant.DARK} />
            <Checkbox label='Billable' variant={CheckboxVariant.DARK} />
          </div>

          <div className='Layer__bill-details__category__add-next'>
            <Button
              variant={ButtonVariant.secondary}
              onClick={() => console.log('Add next')}
            >
              Add next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
