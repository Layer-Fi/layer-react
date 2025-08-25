import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, type PropsWithChildren } from 'react'
import { useCustomJournalEntryForm } from './useCustomJournalEntryForm'
import type { CustomJournalEntry } from '../../schemas/generalLedger/customJournalEntry'
import { Form } from '../ui/Form/Form'
import { HStack, VStack } from '../ui/Stack/Stack'
import { convertCentsToCurrency } from '../../utils/format'
import { Span } from '../ui/Typography/Text'
import { DataState, DataStateStatus } from '../DataState'
import { AlertTriangle, Plus, Trash } from 'lucide-react'
import { TextSize } from '../Typography'
import { flattenValidationErrors } from '../../utils/form'
import { type CustomJournalEntryFormState, EMPTY_DEBIT_LINE_ITEM, EMPTY_CREDIT_LINE_ITEM } from './formUtils'
import { Button } from '../ui/Button/Button'
import { LedgerEntryDirection } from '../../schemas/generalLedger/ledgerAccount'
import { useCategoriesNew } from '../../hooks/categoriesNew/useCategoriesNew'
import { CategoriesListModeEnum } from '../../schemas/categorization'
import { Select } from '../Input/Select'

const CUSTOM_JOURNAL_ENTRY_FORM_CSS_PREFIX = 'Layer__CustomJournalEntryForm'
const CUSTOM_JOURNAL_ENTRY_FORM_FIELD_CSS_PREFIX = `${CUSTOM_JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field`

type CustomJournalEntryFormTotalRowProps = PropsWithChildren<{
  label: string
  value: number
}>

const CustomJournalEntryFormTotalRow = ({ label, value, children }: CustomJournalEntryFormTotalRowProps) => {
  const className = `${CUSTOM_JOURNAL_ENTRY_FORM_CSS_PREFIX}__TotalRow${children ? ` ${CUSTOM_JOURNAL_ENTRY_FORM_CSS_PREFIX}__TotalRow--withField` : ''}`

  return (
    <HStack className={className} align='center' gap='md'>
      <Span>{label}</Span>
      {children}
      <Span align='right'>
        {convertCentsToCurrency(Math.round(value * 100))}
      </Span>
    </HStack>
  )
}

export type CustomJournalEntryFormProps = {
  onSuccess: (entry: CustomJournalEntry) => void
  onChangeFormState?: (formState: CustomJournalEntryFormState) => void
  createdBy: string
}

export const CustomJournalEntryForm = forwardRef<
  { submit: () => void },
  CustomJournalEntryFormProps
>((props, ref) => {
      const { onSuccess, onChangeFormState, createdBy } = props
      const { form, formState, totals, submitError } = useCustomJournalEntryForm({
        onSuccess,
        createdBy,
      })
      const { totalDebits, totalCredits, isBalanced } = totals

      const { data } = useCategoriesNew({ mode: CategoriesListModeEnum.All })
      const categories = useMemo(() => data?.categories ?? [], [data])

      // Process categories into dropdown options
      const categoryOptions = useMemo(() => {
        if (!categories || categories.length === 0) {
          return []
        }
        // this code is wrong since there are subcategories. we'll want something like categories.flatMap(category => category.subCategories?....sort()...)

        // Flatten and sort categories
        return categories
          .sort((a, b) => a.displayName.localeCompare(b.displayName))
          .map(category => ({
            label: category.displayName,
            value: category.type === 'OptionalAccountNested' ? category.stableName : category.id,
          }))
      }, [categories])

      // Prevents default browser form submission behavior
      const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        e.stopPropagation()
      }, [])

      useImperativeHandle(ref, () => ({
        submit: () => form.handleSubmit(),
      }))

      useEffect(() => {
        onChangeFormState?.(formState)
      }, [formState, onChangeFormState])

      return (
        <Form className={CUSTOM_JOURNAL_ENTRY_FORM_CSS_PREFIX} onSubmit={blockNativeOnSubmit}>
          <form.Subscribe selector={state => state.errorMap}>
            {(errorMap) => {
              const validationErrors = flattenValidationErrors(errorMap)
              if (validationErrors.length > 0 || submitError) {
                return (
                  <HStack className={`${CUSTOM_JOURNAL_ENTRY_FORM_CSS_PREFIX}__FormError`}>
                    <DataState
                      icon={<AlertTriangle size={16} />}
                      status={DataStateStatus.failed}
                      title={validationErrors[0] || submitError}
                      titleSize={TextSize.md}
                      inline
                    />
                  </HStack>
                )
              }
            }}
          </form.Subscribe>

          {/* Entry Date Field */}
          <VStack gap='md'>
            <form.AppField name='entryAt'>
              {field => (
                <field.FormDateField
                  label='Entry Date'
                  className={`${CUSTOM_JOURNAL_ENTRY_FORM_FIELD_CSS_PREFIX}__EntryAt`}
                />
              )}
            </form.AppField>
          </VStack>

          {/* Line Items Section */}
          <VStack className={`${CUSTOM_JOURNAL_ENTRY_FORM_CSS_PREFIX}__LineItems`} gap='md'>
            <form.Field name='lineItems' mode='array'>
              {field => (
                <VStack gap='xs' align='baseline'>
                  {/* Debit Entries */}
                  <VStack gap='xs'>
                    <Span>Debit Entries</Span>
                    {field.state.value
                      .map((lineItem, index) => ({ lineItem, index }))
                      .filter(({ lineItem }) => lineItem.direction === LedgerEntryDirection.Debit)
                      .map(({ index }) => (
                        <HStack
                          key={index}
                          gap='xs'
                          align='end'
                          className={`${CUSTOM_JOURNAL_ENTRY_FORM_CSS_PREFIX}__LineItem`}
                        >
                          <VStack gap='xs'>
                            {index === field.state.value.findIndex(item => item.direction === LedgerEntryDirection.Debit) && (
                              <Span>Account</Span>
                            )}
                            <form.Field name={`lineItems[${index}].accountIdentifier`}>
                              {innerField => (
                                <Select
                                  options={categoryOptions}
                                  value={innerField.state.value
                                    ? {
                                      label: categoryOptions.find((opt) => {
                                        if (innerField.state.value?.type === 'AccountId') {
                                          return opt.value === innerField.state.value.id
                                        }
                                        else if (innerField.state.value?.type === 'StableName') {
                                          return opt.value === innerField.state.value.stableName
                                        }
                                        return false
                                      })?.label || '',
                                      value: innerField.state.value.type === 'AccountId' ? innerField.state.value.id : innerField.state.value.stableName,
                                    }
                                    : null}
                                  onChange={(option) => {
                                    if (option) {
                                      // Determine if this is a stable name or account ID based on the selected category
                                      const selectedCategory = categories?.find(cat =>
                                        (cat.type === 'OptionalAccountNested' && cat.stableName === option.value)
                                        || (cat.type !== 'OptionalAccountNested' && cat.id === option.value),
                                      )

                                      if (selectedCategory?.type === 'OptionalAccountNested') {
                                        innerField.handleChange({
                                          stableName: option.value,
                                          type: 'StableName' as const,
                                        })
                                      }
                                      else {
                                        innerField.handleChange({
                                          id: option.value,
                                          type: 'AccountId' as const,
                                        })
                                      }
                                    }
                                    else {
                                      innerField.handleChange(null)
                                    }
                                  }}
                                />
                              )}
                            </form.Field>
                          </VStack>
                          <form.AppField name={`lineItems[${index}].amount`}>
                            {innerField => (
                              <innerField.FormBigDecimalField
                                label='Amount'
                                mode='currency'
                                showLabel={index === field.state.value.findIndex(item => item.direction === LedgerEntryDirection.Debit)}
                              />
                            )}
                          </form.AppField>
                          <form.AppField name={`lineItems[${index}].memo`}>
                            {innerField => (
                              <innerField.FormTextField
                                label='Line Memo'
                                showLabel={index === field.state.value.findIndex(item => item.direction === LedgerEntryDirection.Debit)}
                              />
                            )}
                          </form.AppField>
                          <Button
                            variant='outlined'
                            icon
                            aria-label='Delete debit line item'
                            onClick={() => field.removeValue(index)}
                          >
                            <Trash size={16} />
                          </Button>
                        </HStack>
                      ))}
                    <Button variant='outlined' onClick={() => field.pushValue(EMPTY_DEBIT_LINE_ITEM)}>
                      Add debit entry
                      <Plus size={16} />
                    </Button>
                  </VStack>

                  {/* Credit Entries */}
                  <VStack gap='xs'>
                    <Span>Credit Entries</Span>
                    {field.state.value
                      .map((lineItem, index) => ({ lineItem, index }))
                      .filter(({ lineItem }) => lineItem.direction === LedgerEntryDirection.Credit)
                      .map(({ index }) => (
                        <HStack
                          key={index}
                          gap='xs'
                          align='end'
                          className={`${CUSTOM_JOURNAL_ENTRY_FORM_CSS_PREFIX}__LineItem`}
                        >
                          <VStack gap='xs'>
                            {index === field.state.value.findIndex(item => item.direction === LedgerEntryDirection.Credit) && (
                              <Span>Account</Span>
                            )}
                            <form.Field name={`lineItems[${index}].accountIdentifier`}>
                              {innerField => (
                                <Select
                                  options={categoryOptions}
                                  value={innerField.state.value
                                    ? {
                                      label: categoryOptions.find((opt) => {
                                        if (innerField.state.value?.type === 'AccountId') {
                                          return opt.value === innerField.state.value.id
                                        }
                                        else if (innerField.state.value?.type === 'StableName') {
                                          return opt.value === innerField.state.value.stableName
                                        }
                                        return false
                                      })?.label || '',
                                      value: innerField.state.value.type === 'AccountId' ? innerField.state.value.id : innerField.state.value.stableName,
                                    }
                                    : null}
                                  onChange={(option) => {
                                    if (option) {
                                      // Determine if this is a stable name or account ID based on the selected category
                                      const selectedCategory = categories?.find(cat =>
                                        (cat.type === 'OptionalAccountNested' && cat.stableName === option.value)
                                        || (cat.type !== 'OptionalAccountNested' && cat.id === option.value),
                                      )

                                      if (selectedCategory?.type === 'OptionalAccountNested') {
                                        innerField.handleChange({
                                          stableName: option.value,
                                          type: 'StableName' as const,
                                        })
                                      }
                                      else {
                                        innerField.handleChange({
                                          id: option.value,
                                          type: 'AccountId' as const,
                                        })
                                      }
                                    }
                                    else {
                                      innerField.handleChange(null)
                                    }
                                  }}
                                />
                              )}
                            </form.Field>
                          </VStack>
                          <form.AppField name={`lineItems[${index}].amount`}>
                            {innerField => (
                              <innerField.FormBigDecimalField
                                label='Amount'
                                mode='currency'
                                showLabel={index === field.state.value.findIndex(item => item.direction === LedgerEntryDirection.Credit)}
                              />
                            )}
                          </form.AppField>
                          <form.AppField name={`lineItems[${index}].memo`}>
                            {innerField => (
                              <innerField.FormTextField
                                label='Line Memo'
                                showLabel={index === field.state.value.findIndex(item => item.direction === LedgerEntryDirection.Credit)}
                              />
                            )}
                          </form.AppField>
                          <Button
                            variant='outlined'
                            icon
                            aria-label='Delete credit line item'
                            onClick={() => field.removeValue(index)}
                          >
                            <Trash size={16} />
                          </Button>
                        </HStack>
                      ))}
                    <Button variant='outlined' onClick={() => field.pushValue(EMPTY_CREDIT_LINE_ITEM)}>
                      Add credit entry
                      <Plus size={16} />
                    </Button>
                  </VStack>
                </VStack>
              )}
            </form.Field>
          </VStack>

          {/* Memo and Totals Section */}
          <VStack className={`${CUSTOM_JOURNAL_ENTRY_FORM_CSS_PREFIX}__Metadata`} pbs='md'>
            <HStack justify='space-between' gap='xl'>
              <VStack className={`${CUSTOM_JOURNAL_ENTRY_FORM_CSS_PREFIX}__AdditionalTextFields`}>
                <form.AppField name='memo'>
                  {field => <field.FormTextAreaField label='Memo' />}
                </form.AppField>
                <form.AppField name='referenceNumber'>
                  {field => <field.FormTextField label='Reference Number' />}
                </form.AppField>
              </VStack>
              <VStack className={`${CUSTOM_JOURNAL_ENTRY_FORM_CSS_PREFIX}__TotalFields`} fluid>
                <CustomJournalEntryFormTotalRow label='Total Debits' value={totalDebits} />
                <CustomJournalEntryFormTotalRow label='Total Credits' value={totalCredits} />
                <CustomJournalEntryFormTotalRow
                  label={isBalanced ? 'Balanced ' : 'Out of Balance '}
                  value={Math.abs(totalDebits - totalCredits)}
                />
              </VStack>
            </HStack>
          </VStack>
        </Form>
      )
    })

CustomJournalEntryForm.displayName = 'CustomJournalEntryForm'
