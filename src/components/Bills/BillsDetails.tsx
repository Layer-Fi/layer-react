import React, { RefObject } from 'react'
import { useBillsContext, useBillsRecordPaymentContext } from '../../contexts/BillsContext'
import { BackButton, Button, ButtonVariant } from '../Button'
import { DatePicker } from '../DatePicker/DatePicker'
import { Header, HeaderRow, HeaderCol } from '../Header'
import { Input, InputGroup } from '../Input'
import { Checkbox, CheckboxVariant } from '../Input/Checkbox' // @TODO use/merge with ui/Checkbox?
import { Select } from '../Input/Select'
import { Textarea } from '../Textarea'
import { TextWeight, TextSize, Text } from '../Typography'
import { useBillForm } from './useBillForm'
import classNames from 'classnames'
import { Bill } from '../../types'
import { convertNumberToCurrency } from '../../utils/format'
import { formatISO, parseISO } from 'date-fns'
import { Panel } from '../Panel'
import { BillsSidebar } from './BillsSidebar'
import { BillTerms, UnpaidStatuses } from '../../types/bills'

export const BillsDetails = ({
  bill,
  containerRef,
}: {
  bill: Bill
  containerRef: RefObject<HTMLDivElement>
}) => {
  const { billInDetails, closeBillDetails } = useBillsContext()
  const { showRecordPaymentForm, recordPaymentForBill } = useBillsRecordPaymentContext()
  const { form } = useBillForm(bill)

  const isDirty = form.state.isDirty || form.state.isTouched

  const baseClassName = classNames(
    'Layer__bills-account__index',
    billInDetails && 'open',
  )

  return (
    <form
      className={baseClassName}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <Panel
        sidebar={<BillsSidebar parentRef={containerRef} />}
        sidebarIsOpen={showRecordPaymentForm}
        parentRef={containerRef}
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
              {UnpaidStatuses.includes(bill.status) && !showRecordPaymentForm
                ? (
                  <Button type='button' onClick={() => recordPaymentForBill(bill)}>
                    Record payment
                  </Button>
                )
                : null}
              {isDirty && !showRecordPaymentForm
                ? (
                  <Button type='submit'>
                    Save
                  </Button>
                )
                : null}
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
                <form.Field name='terms'>
                  {field => (
                    <InputGroup inline={true} label='Terms'>
                      <Select
                        value={BillTerms.find(t => t.id === field.state.value)}
                        options={BillTerms}
                        onChange={x => field.handleChange(x.id)}
                      />
                    </InputGroup>
                  )}
                </form.Field>
                <form.Field name='received_at'>
                  {field => (
                    <InputGroup inline={true} label='Bill date'>
                      <DatePicker
                        displayMode='dayPicker'
                        selected={field.state.value ? parseISO(field.state.value) : new Date()}
                        onChange={e => field.handleChange(formatISO(e as Date))}
                        dateFormat='MM/dd/yyyy'
                      />
                    </InputGroup>
                  )}
                </form.Field>
              </div>
              <div className='Layer__bill-details__form-col'>
                <form.Field name='bill_number'>
                  {field => (
                    <InputGroup inline={true} label='Bill no.'>
                      <Input
                        value={field.state.value}
                        onChange={e => field.handleChange((e.target as HTMLInputElement).value)}
                      />
                    </InputGroup>
                  )}
                </form.Field>
                <form.Field name='due_date'>
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
                          maxDate={null}
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

                          <form.Field name={`line_items[${i}].total_amount`}>
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

                          <form.Field name={`line_items[${i}].description`}>
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

                          <form.Field name={`line_items[${i}].tax`}>
                            {(subField) => {
                              return (
                                <Checkbox label='Tax' variant={CheckboxVariant.DARK} />
                              )
                            }}
                          </form.Field>

                          <form.Field name={`line_items[${i}].billable`}>
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
                        type='button'
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
      </Panel>
    </form>
  )
}
