import { RefObject } from 'react'
import { useBillsContext, useBillsRecordPaymentContext } from '../../contexts/BillsContext'
import { BackButton, DeprecatedButton, ButtonVariant, IconButton, RetryButton, SubmitButton, TextButton } from '../Button'
import { DatePicker } from '../DatePicker/DatePicker'
import { Header, HeaderRow, HeaderCol } from '../Header'
import { Input, InputGroup } from '../Input'
import { Select } from '../Input/Select'
import { Textarea } from '../Textarea'
import { TextWeight, TextSize, Text, ErrorText } from '../Typography'
import { EditableBill, useBillForm } from './useBillForm'
import type { Bill, Category } from '../../types'
import { formatDate } from '../../utils/format'
import { formatISO, parseISO } from 'date-fns'
import { Panel } from '../Panel'
import { BillsSidebar } from './BillsSidebar'
import { BillTerms } from '../../types/bills'
import { SelectVendor } from '../Vendors/SelectVendor'
import { CategorySelect, mapCategoryToOption } from '../CategorySelect/CategorySelect'
import { AmountInput } from '../Input/AmountInput'
import { getVendorName } from '../../utils/vendors'
import { DATE_FORMAT_SHORT, DATE_FORMAT_SHORT_PADDED } from '../../config/general'
import { BillSummary } from './BillSummary'
import { isBillPaid, isBillUnpaid } from '../../utils/bills'
import { useCategories } from '../../hooks/categories/useCategories'
import CloseIcon from '../../icons/CloseIcon'
import { HStack } from '../ui/Stack/Stack'
import { notEmpty } from '../../utils/form'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'

const flattenCategories = (categories: Category[]): Category[] => {
  return categories.reduce((acc: Category[], category) => {
    acc.push(category)
    if (category.subCategories?.length) {
      acc.push(...flattenCategories(category.subCategories))
    }
    return acc
  }, [])
}

const findCategoryById = (id: string, categories?: Category[]) => {
  if (!categories) {
    return undefined
  }

  return flattenCategories(categories).find(
    category => ('id' in category && category.id === id),
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
  bill?: Bill
  containerRef: RefObject<HTMLDivElement>
}) => {
  const { data: categories } = useCategories()
  const { closeBillDetails } = useBillsContext()
  const { showRecordPaymentForm, recordPaymentForBill } = useBillsRecordPaymentContext()
  const { form, isDirty, submitError, formErrorMap } = useBillForm((bill ? { ...bill } : {}) as EditableBill)

  const { isSubmitting } = form.state
  const disabled = isBillPaid(bill?.status) || isSubmitting

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
                {bill?.id ? 'Bill details' : 'New bill'}
              </Text>
              <Text
                size={TextSize.sm}
                className='Layer__bills-account__header__date'
              >
                {getVendorName(bill?.vendor)}
                {' '}
                {formatDate(bill?.due_at, DATE_FORMAT_SHORT)}
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
          <HStack gap='sm' justify={bill ? 'space-between' : 'end'} className='Layer__bill-details__section Layer__bill-details__head' {...toDataProperties({ newbill: !bill })}>
            {bill && (<BillSummary bill={bill} />)}

            <HStack gap='sm' className='Layer__bill-details__action'>
              {bill && isBillUnpaid(bill.status) && !showRecordPaymentForm
                ? (
                  <DeprecatedButton type='button' onClick={() => recordPaymentForBill(bill)}>
                    Record payment
                  </DeprecatedButton>
                )
                : null}
              {bill && isDirty && !showRecordPaymentForm
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
              {!bill && (
                <SubmitButton
                  type='submit'
                  processing={isSubmitting}
                  disabled={isSubmitting || !isDirty}
                  className='Layer__bill-details__save-btn'
                  noIcon={true}
                >
                  Save
                </SubmitButton>
              )}
            </HStack>
          </HStack>

          <div className='Layer__bill-details__section'>
            <div className='Layer__bill-details__form-row'>
              <div className='Layer__bill-details__form-col'>
                <form.Field
                  name='vendor'
                  validators={{ onSubmit: ({ value }) => value ? undefined : 'Vendor is required' }}
                >
                  {field => (
                    <>
                      <InputGroup inline={true} label='Vendor'>
                        <SelectVendor
                          value={field.state.value ?? null}
                          onChange={vendor => field.handleChange(vendor ?? undefined)}
                          disabled={disabled}
                          isInvalid={field.state.meta.errors.length > 0}
                          errorMessage={field.state.meta.errors.join(', ')}
                        />
                      </InputGroup>

                      <InputGroup inline={true} label='Address'>
                        <Textarea
                          value={field.state.value?.address_string ?? undefined}
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
                        dateFormat={DATE_FORMAT_SHORT_PADDED}
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
                        dateFormat={DATE_FORMAT_SHORT_PADDED}
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
                              /**
                               * @TODO after merging new categorize menu, add validation for the Category Select
                               */
                              const selectedCategory =
                                subField.state.value
                                  ? findCategoryById(subField.state.value.id, categories)
                                  : undefined

                              return (
                                <CategorySelect
                                  value={selectedCategory
                                    ? mapCategoryToOption(selectedCategory)
                                    : undefined}
                                  onChange={e => subField.handleChange(
                                    { type: 'AccountId', id: e.payload.id },
                                  )}
                                  showTooltips={false}
                                  disabled={disabled}
                                />
                              )
                            }}
                          </form.Field>

                          <form.Field
                            name={`line_items[${i}].total_amount`}
                            validators={{
                              onSubmit: ({ value }) => notEmpty(value?.toString()) ? undefined : 'Unit price is required',
                            }}
                          >
                            {(subField) => {
                              return (
                                <AmountInput
                                  value={subField.state.value === null ? undefined : subField.state.value}
                                  onChange={e => subField.handleChange(e === undefined ? null : e)}
                                  disabled={disabled}
                                  isInvalid={subField.state.meta.errors.length > 0}
                                  errorMessage={subField.state.meta.errors.join(', ')}
                                />
                              )
                            }}
                          </form.Field>

                          <form.Field
                            name={`line_items[${i}].product_name`}
                            validators={{
                              onSubmit: ({ value }) => notEmpty(value?.toString()) ? undefined : 'Product name is required',
                            }}
                          >
                            {(subField) => {
                              return (
                                <Input
                                  value={subField.state.value}
                                  onChange={e =>
                                    subField.handleChange((e.target as HTMLInputElement).value)}
                                  placeholder='Product name'
                                  disabled={disabled}
                                  isInvalid={subField.state.meta.errors.length > 0}
                                  errorMessage={subField.state.meta.errors.join(', ')}
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
                          <div slot='delete-btn'>
                            <IconButton type='button' slot='desktop-button' icon={<CloseIcon />} onClick={() => field.removeValue(i)} />
                            <TextButton type='button' slot='mobile-button' onClick={() => field.removeValue(i)}>Remove item</TextButton>
                          </div>
                        </div>
                      )
                    })}
                    <div className='Layer__bill-details__category__add-next'>
                      <DeprecatedButton
                        type='button'
                        variant={ButtonVariant.secondary}
                        onClick={() => field.pushValue({})}
                        disabled={disabled}
                      >
                        Add next
                      </DeprecatedButton>
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
            {formErrorMap?.onSubmit === 'MISSING_LINE_ITEMS' && (
              <ErrorText>
                Please add at least one line item
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
