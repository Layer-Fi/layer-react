import { RefObject } from 'react'
import { useBillsContext, useBillsRecordPaymentContext } from '../../contexts/BillsContext'
import { BackButton, Button, ButtonVariant, RetryButton, SubmitButton } from '../Button'
import { DatePicker } from '../DatePicker/DatePicker'
import { Header, HeaderRow, HeaderCol } from '../Header'
import { Input, InputGroup } from '../Input'
import { Select } from '../Input/Select'
import { Textarea } from '../Textarea'
import { TextWeight, TextSize, Text, ErrorText } from '../Typography'
import { useBillForm } from './useBillForm'
import { Bill, Category } from '../../types'
import { formatDate } from '../../utils/format'
import { formatISO, parseISO } from 'date-fns'
import { Panel } from '../Panel'
import { BillsSidebar } from './BillsSidebar'
import { BillTerms } from '../../types/bills'
import { SelectVendor } from '../Vendors/SelectVendor'
import { CategorySelect } from '../CategorySelect/CategorySelect'
import { useLayerContext } from '../../contexts/LayerContext'
import { AmountInput } from '../Input/AmountInput'
import { getVendorName } from '../../utils/vendors'
import { DATE_FORMAT_SHORT } from '../../config/general'
import { BillSummary } from './BillSummary'
import { isBillUnpaid } from '../../utils/bills'
import { flattenCategories } from '../BankTransactionMobileList/utils'

const findCategoryById = (id: string, categories: Category[]) => {
  return flattenCategories(categories).find(
    category => (category.id === id),
  )
}

const convertToInputDate = (date?: string) => {
  const d = date ? parseISO(date) : new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export const BillsDetails = ({
  bill,
  containerRef,
}: {
  bill: Bill
  containerRef: RefObject<HTMLDivElement>
}) => {
  const { categories } = useLayerContext()
  const { closeBillDetails } = useBillsContext()
  const { showRecordPaymentForm, recordPaymentForBill } = useBillsRecordPaymentContext()
  const { form, isDirty, submitError, formErrorMap } = useBillForm(bill)

  const { isSubmitting } = form.state
  const disabled = !bill?.status.includes('PAID') || isSubmitting

  return (
    <Panel
      sidebar={<BillsSidebar />}
      sidebarIsOpen={showRecordPaymentForm}
      parentRef={containerRef}
      className='Layer__bills-account__index'
      floating={true}
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
                {getVendorName(bill.vendor)}
                {' '}
                {formatDate(bill.due_at, DATE_FORMAT_SHORT)}
              </Text>
            </div>
          </HeaderCol>
        </HeaderRow>
      </Header>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}

      >
        <div className='Layer__bill-details__content'>
          <div className='Layer__bill-details__section Layer__bill-details__head'>
            <BillSummary bill={bill} />
            <div className='Layer__bill-details__action'>
              {isBillUnpaid(bill.status) && !showRecordPaymentForm
                ? (
                  <Button type='button' onClick={() => recordPaymentForBill(bill)}>
                    Record payment
                  </Button>
                )
                : null}
              {isDirty && !showRecordPaymentForm
                ? submitError
                  ? (
                    <RetryButton
                      type='submit'
                      processing={isSubmitting}
                      disabled={isSubmitting}
                      className='Layer__bill-details__save-btn'
                      error={submitError}
                    >
                      Save
                    </RetryButton>
                  )
                  : (
                    <SubmitButton
                      type='submit'
                      processing={isSubmitting}
                      disabled={isSubmitting}
                      className='Layer__bill-details__save-btn'
                      noIcon={true}
                    >
                      Save
                    </SubmitButton>
                  )
                : null}
            </div>
          </div>

          <div className='Layer__bill-details__section'>
            <div className='Layer__bill-details__form-row'>
              <div className='Layer__bill-details__form-col'>
                <form.Field name='vendor'>
                  {field => (
                    <>
                      <InputGroup inline={true} label='Vendor'>
                        <SelectVendor
                          value={field.state.value ?? null}
                          onChange={vendor => field.handleChange(vendor ?? undefined)}
                          disabled={disabled}
                        />
                      </InputGroup>

                      <InputGroup inline={true} label='Adress'>
                        <Textarea
                          value={field.state.value?.address_string ?? ''}
                          disabled={true}
                        />
                      </InputGroup>
                    </>
                  )}
                </form.Field>
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
                        disabled={disabled}
                      />
                    </InputGroup>
                  )}
                </form.Field>
                <form.Field name='received_at'>
                  {field => (
                    <InputGroup inline={true} label='Bill date'>
                      <DatePicker
                        displayMode='dayPicker'
                        selected={convertToInputDate(field.state.value)}
                        onChange={e => field.handleChange(formatISO(e as Date))}
                        dateFormat='MM/dd/yyyy'
                        disabled={disabled}
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
                        disabled={disabled}
                      />
                    </InputGroup>
                  )}
                </form.Field>
                <form.Field name='due_at'>
                  {field => (
                    <InputGroup inline={true} label='Due date'>
                      <DatePicker
                        displayMode='dayPicker'
                        selected={convertToInputDate(field.state.value)}
                        onChange={(d) => {
                          const x = d as Date
                          x.setHours(0, 0, 0, 0)
                          field.handleChange(formatISO(x))
                        }}
                        maxDate={null}
                        dateFormat='MM/dd/yyyy'
                        disabled={disabled}
                      />
                    </InputGroup>
                  )}
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
                          <form.Field name={`line_items[${i}].account_identifier`}>
                            {(subField) => {
                              const selectedCategory =
                                subField.state.value
                                  ? findCategoryById(subField.state.value.id, categories)
                                  : undefined

                              return (
                                <CategorySelect
                                  value={selectedCategory && selectedCategory.value.payload
                                    ? {
                                      type: selectedCategory.value.type,
                                      payload: selectedCategory.value.payload,
                                    }
                                    : undefined}
                                  onChange={e => subField.handleChange(
                                    { type: 'AccountId', id: e.payload.id, product_name: e.payload.display_name },
                                  )}
                                  showTooltips={false}
                                  disabled={disabled}
                                />
                              )
                            }}
                          </form.Field>

                          <form.Field name={`line_items[${i}].total_amount`}>
                            {(subField) => {
                              return (
                                <AmountInput
                                  value={subField.state.value}
                                  onChange={e => subField.handleChange(e)}
                                  disabled={disabled}
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
                                  disabled={disabled}
                                />
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
                        disabled={disabled}
                      >
                        Add next
                      </Button>
                    </div>
                  </div>
                )
              }}
            </form.Field>
            {formErrorMap?.onSubmit === 'INVALID_TOTAL_AMOUNT' && (
              <ErrorText>
                Categories amount doesn&apos;t match the bill amount
              </ErrorText>
            )}
          </div>
          {isDirty && !showRecordPaymentForm && (
            <div className='Layer__bill-details__save-btn--mobile'>
              {submitError
                ? (
                  <RetryButton
                    type='submit'
                    processing={isSubmitting}
                    disabled={isSubmitting}
                    error={submitError}
                  >
                    Save
                  </RetryButton>
                )
                : (
                  <SubmitButton
                    type='submit'
                    processing={isSubmitting}
                    disabled={isSubmitting}
                    noIcon={true}
                  >
                    Save
                  </SubmitButton>
                )}
            </div>
          )}
        </div>
      </form>
    </Panel>
  )
}
