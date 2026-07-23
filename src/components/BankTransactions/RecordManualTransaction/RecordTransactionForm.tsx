import { type PropsWithChildren, type ReactNode } from 'react'
import { type CalendarDate, getLocalTimeZone, today } from '@internationalized/date'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { isClassificationExclusion } from '@schemas/categorization'
import { getDefaultSelectedCategoryForBankTransaction } from '@utils/bankTransactions/shared'
import { dateNotBefore, dateNotInFuture, positiveAmount, required } from '@utils/form/validators'
import { convertDateToLocalCalendarDate } from '@utils/time/timeUtils'
import { useTaxCodeOptions } from '@hooks/features/bankTransactions/useTaxCodeOptions'
import { useBusinessActivationDate } from '@hooks/features/business/useBusinessActivationDate'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Form } from '@ui/Form/Form'
import { Label } from '@ui/Typography/Text'
import { isSplitAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { RecordTransactionFormCategoryCombobox } from '@components/BankTransactions/RecordManualTransaction/RecordTransactionFormCategoryCombobox'
import { type RecordTransactionFormApi, type RecordTransactionVariant } from '@components/BankTransactions/RecordManualTransaction/useRecordTransactionForm'
import { CustomAccountComboBox } from '@components/CustomAccountComboBox/CustomAccountComboBox'
import { isNewAccountOption } from '@components/CustomAccountComboBox/utils'
import { TaxCodeComboBox } from '@components/TaxCodeSelect/TaxCodeComboBox'
import { ErrorText } from '@components/Typography/ErrorText'

import './recordTransactionForm.scss'

function FieldErrors({ errors }: { errors: ReadonlyArray<unknown> }) {
  if (errors.length === 0) return null
  return (
    <div className='Layer__RecordTransactionForm__Error'>
      <ErrorText size='xs'>{errors[0] as ReactNode}</ErrorText>
    </div>
  )
}

function RecordTransactionFormField({ withFieldLayout = true, children }: PropsWithChildren<{ withFieldLayout?: boolean }>) {
  if (!withFieldLayout) return <>{children}</>
  return <div className='Layer__RecordTransactionForm__Field'>{children}</div>
}

type RecordTransactionFormProps = {
  form: RecordTransactionFormApi
  variant: RecordTransactionVariant
  transaction?: BankTransaction
}

export function RecordTransactionForm({ form, variant, transaction }: RecordTransactionFormProps) {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const { taxCodeOptions, hasTaxCodeOptions, getSelectedTaxCodeOption } = useTaxCodeOptions(transaction)
  const activationDate = useBusinessActivationDate()
  const { isMobile } = useSizeClass()
  const isInline = !isMobile
  const isExpense = variant === 'expense'
  // Editing keeps a recorded transaction on its original account.
  const isAccountReadOnly = transaction !== undefined

  const category = transaction ? getDefaultSelectedCategoryForBankTransaction(transaction) : null
  const isMultiSplit = category !== null && isSplitAsOption(category) && !category.isSingleSplit

  const accountLabel = isExpense
    ? t('bankTransactions:recordTransaction.label.paid_from', 'Paid from')
    : t('bankTransactions:recordTransaction.label.deposited_in', 'Deposited in')

  const payeeLabel = isExpense
    ? t('bankTransactions:recordTransaction.label.payee', 'Payee')
    : t('bankTransactions:recordTransaction.label.payer', 'Payer')
  const payeePlaceholder = isExpense
    ? t('bankTransactions:recordTransaction.placeholder.payee', 'Who you paid')
    : t('bankTransactions:recordTransaction.placeholder.payer', 'Who paid you')
  const payeeRequiredMessage = isExpense
    ? t('bankTransactions:recordTransaction.validation.payee_required', 'Payee is required')
    : t('bankTransactions:recordTransaction.validation.payer_required', 'Payer is required')

  return (
    <Form
      className={classNames('Layer__RecordTransactionForm', isMobile && 'Layer__RecordTransactionForm--mobile')}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <form.Field
        name='account'
        validators={{ onDynamic: ({ value }) => required(t('bankTransactions:recordTransaction.validation.account_required', 'Account is required'))(value) }}
      >
        {(field) => {
          const isCreatingAccount = isNewAccountOption(field.state.value)
          return (
            <RecordTransactionFormField withFieldLayout={!isCreatingAccount}>
              <CustomAccountComboBox
                inputId='record-transaction-account'
                label={accountLabel}
                placeholder={t('bankTransactions:recordTransaction.placeholder.account', 'Select account...')}
                showLabel={!isCreatingAccount}
                inline={!isCreatingAccount && isInline}
                isInvalid={field.state.meta.errors.length > 0}
                isReadOnly={isAccountReadOnly}
                selectedAccount={field.state.value}
                onSelectAccount={field.handleChange}
              />
              <FieldErrors errors={field.state.meta.errors} />
            </RecordTransactionFormField>
          )
        }}
      </form.Field>

      <form.Subscribe selector={state => isNewAccountOption(state.values.account)}>
        {isCreatingAccount => isCreatingAccount
          ? null
          : (
            <>
              <form.AppField
                name='description'
                validators={{ onDynamic: ({ value }) => required(payeeRequiredMessage)(value) }}
              >
                {field => (
                  <field.FormTextField
                    label={payeeLabel}
                    inline={isInline}
                    placeholder={payeePlaceholder}
                  />
                )}
              </form.AppField>

              <form.AppField
                name='date'
                validators={{
                  onDynamic: ({ value }) =>
                    required(t('bankTransactions:recordTransaction.validation.date_required', 'Date is required'))(value)
                    ?? dateNotInFuture(t('bankTransactions:recordTransaction.validation.date_in_future', 'Date cannot be in the future'))(value)
                    ?? dateNotBefore(activationDate, t('bankTransactions:recordTransaction.validation.date_before_activation', 'Date cannot be before the business activation date'))(value),
                }}
              >
                {field => (
                  <field.FormDatePickerField<CalendarDate>
                    label={t('common:label.date', 'Date')}
                    inline={isInline}
                    minDate={activationDate ? convertDateToLocalCalendarDate(activationDate) : undefined}
                    maxDate={today(getLocalTimeZone())}
                  />
                )}
              </form.AppField>

              <form.Subscribe selector={state => isMultiSplit && state.values.category === null}>
                {isAmountReadOnly => (
                  <form.AppField
                    name='amount'
                    validators={{ onDynamic: ({ value }) => positiveAmount(t('bankTransactions:recordTransaction.validation.amount_greater_than_zero', 'Amount must be greater than zero'))(value) }}
                  >
                    {field => (
                      <field.FormNonRecursiveBigDecimalField
                        label={t('common:label.amount', 'Amount')}
                        inline={isInline}
                        mode='currency'
                        placeholder={formatCurrencyFromCents(0)}
                        isReadOnly={isAmountReadOnly}
                      />
                    )}
                  </form.AppField>
                )}
              </form.Subscribe>

              <form.Field
                name='category'
                validators={{ onDynamic: ({ value }) => isMultiSplit ? undefined : required(t('bankTransactions:recordTransaction.validation.category_required', 'Category is required'))(value) }}
              >
                {field => (
                  <RecordTransactionFormField>
                    <RecordTransactionFormCategoryCombobox
                      label={t('common:label.category', 'Category')}
                      placeholder={t('bankTransactions:recordTransaction.placeholder.category', 'Select category...')}
                      inline={isInline}
                      isInvalid={field.state.meta.errors.length > 0}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      transaction={transaction}
                      category={category}
                    />
                    <FieldErrors errors={field.state.meta.errors} />
                  </RecordTransactionFormField>
                )}
              </form.Field>

              {hasTaxCodeOptions && (
                <form.Subscribe selector={state => state.values.category}>
                  {category => (
                    <form.Field name='taxCode'>
                      {field => (
                        <RecordTransactionFormField>
                          <Label size='sm'>{t('bankTransactions:label.tax_code', 'Tax code')}</Label>
                          <TaxCodeComboBox
                            options={taxCodeOptions}
                            selectedValue={getSelectedTaxCodeOption(field.state.value)}
                            onSelectedValueChange={option => field.handleChange(option?.value ?? null)}
                            isDisabled={category === null || isClassificationExclusion(category)}
                          />
                        </RecordTransactionFormField>
                      )}
                    </form.Field>
                  )}
                </form.Subscribe>
              )}

              <form.AppField name='memo'>
                {field => (
                  <field.FormTextAreaField
                    label={t('common:label.description', 'Description')}
                    inline={isInline}
                    placeholder={t('common:action.add_description', 'Add a description')}
                  />
                )}
              </form.AppField>
            </>
          )}
      </form.Subscribe>
    </Form>
  )
}
