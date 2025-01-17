import React from 'react'
import { useBillsContext } from '../../contexts/BillsContext'
import { BackButton, Button, ButtonVariant } from '../Button'
import { DatePicker } from '../DatePicker/DatePicker'
import { Header, HeaderRow, HeaderCol } from '../Header'
import { Input, InputGroup } from '../Input'
import { Checkbox, CheckboxVariant } from '../Input/Checkbox'
import { Select } from '../Input/Select'
import { Textarea } from '../Textarea'
import { TextWeight, TextSize, Text } from '../Typography'
import { useBillForm } from './useBillForm'
import classNames from 'classnames'
import { Bill } from '../../types'
import { convertNumberToCurrency } from '../../utils/format'
import { formatISO, parseISO } from 'date-fns'

export const BillsDetails = ({ bill }: { bill: Bill }) => {
  const { billInDetails, closeBillDetails } = useBillsContext()
  const { form } = useBillForm(bill)

  const baseClassName = classNames(
    'Layer__bills-account__index',
    billInDetails && 'open',
  )

  console.log('form', form)

  return (
    <form
      className={baseClassName}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
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
                {convertNumberToCurrency(bill.total_amount)}
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
            <Button type='submit'>
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
                  value={bill.vendor?.address_string}
                  disabled={true}
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
                  displayMode='dayPicker'
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
              <form.Field
                name='due_date'
              >
                {(field) => {
                  // @TODO - can this conversion be done better?
                  const a = field.state.value ? parseISO(field.state.value) : new Date()
                  a.setHours(0, 0, 0, 0)
                  return (
                    <InputGroup inline={true} label='Due date'>
                      <DatePicker
                        displayMode='dayPicker'
                        selected={a}
                        onChange={(d) => {
                          const x = d as Date
                          x.setHours(0, 0, 0, 0)
                          field.handleChange(formatISO(x))
                        }}
                        dateFormat='MM/dd/yyyy'
                      />
                    </InputGroup>
                  )
                }}
              </form.Field>

            </div>
          </div>
        </div>

        <div className='Layer__bill-details__section Layer__bill-details__section--category-details'>
          <div className='Layer__bill-details__form-row'>
            <Text weight={TextWeight.bold} size={TextSize.sm}>
              Category details
            </Text>
          </div>

          <form.Field name='line_items' mode='array'>
            {(field) => {
              return (
                <div>
                  {field.state.value?.map((_, i) => {
                    return (
                      <div key={i} className='Layer__bill-details__category-row'>
                        <form.Field name={`line_items[${i}].product`}>
                          {(subField) => {
                            return (
                              <Select
                                value='Legal & Professional Fees:Acco...'
                                options={[
                                  {
                                    label: 'Legal & Professional Fees',
                                    options: ['Legal & Professional Fees:Acco...'],
                                  },
                                ]}
                                onChange={e => subField.handleChange(e)}
                              />
                            )
                          }}
                        </form.Field>
                        <form.Field key={i} name={`line_items[${i}].total_amount`}>
                          {(subField) => {
                            return (
                              <Input
                                value={subField.state.value}
                                onChange={e =>
                                  subField.handleChange(
                                    Number((e.target as HTMLInputElement).value))}
                                placeholder='Description'
                              />
                            )
                          }}
                        </form.Field>

                        <form.Field key={i} name={`line_items[${i}].description`}>
                          {(subField) => {
                            return (
                              <Input
                                value={subField.state.value}
                                onChange={e =>
                                  subField.handleChange((e.target as HTMLInputElement).value)}
                                placeholder='Description'
                              />
                            )
                          }}
                        </form.Field>

                        <form.Field key={i} name={`line_items[${i}].description`}>
                          {(subField) => {
                            return (
                              <Checkbox checked label='Tax' variant={CheckboxVariant.DARK} />
                            )
                          }}
                        </form.Field>

                        <form.Field key={i} name={`line_items[${i}].description`}>
                          {(subField) => {
                            return (
                              <Checkbox label='Billable' variant={CheckboxVariant.DARK} />
                            )
                          }}
                        </form.Field>
                      </div>
                    )
                  })}
                  <div className='Layer__bill-details__category__add-next'>
                    <Button
                      variant={ButtonVariant.secondary}
                      onClick={() => field.pushValue({})}
                    >
                      Add next
                    </Button>
                  </div>
                </div>
              )
            }}

          </form.Field>
        </div>
      </div>
    </form>
  )
}
