import { type PropsWithChildren, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { isClassificationExclusion } from '@schemas/categorization'
import { positiveAmount, required } from '@utils/form/validators'
import { useTaxCodeOptions } from '@hooks/features/bankTransactions/useTaxCodeOptions'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import type { BankTransactionCategorization } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { Form } from '@ui/Form/Form'
import { Label } from '@ui/Typography/Text'
import { isSplitAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { RecordTransactionCounterpartySelector } from '@components/BankTransactions/RecordManualTransaction/RecordTransactionCounterpartySelector'
import { RecordTransactionsFormCategoryCombobox } from '@components/BankTransactions/RecordManualTransaction/RecordTransactionsFormCategoryCombobox'
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
  categorization?: BankTransactionCategorization
}

export function RecordTransactionForm({ form, variant, transaction, categorization }: RecordTransactionFormProps) {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const { taxCodeOptions, hasTaxCodeOptions, getSelectedTaxCodeOption } = useTaxCodeOptions(transaction)
  const isExpense = variant === 'expense'
  // Editing keeps a recorded transaction on its original account.
  const isAccountReadOnly = transaction !== undefined

  const category = categorization?.category ?? null
  // A multi-entry split has no single classification: lock the amount and skip the category
  // requirement until the user replaces it with a real category.
  const isMultiSplit = category !== null && isSplitAsOption(category) && !category.isSingleSplit

  const accountLabel = isExpense
    ? t('bankTransactions:recordTransaction.label.paid_to', 'Paid to')
    : t('bankTransactions:recordTransaction.label.deposited_in', 'Deposited in')
  const counterpartyLabel = isExpense
    ? t('bankTransactions:recordTransaction.label.vendor', 'Vendor')
    : t('bankTransactions:recordTransaction.label.customer', 'Customer')
  const counterpartyPlaceholder = isExpense
    ? t('bankTransactions:recordTransaction.placeholder.vendor', 'Select vendor...')
    : t('bankTransactions:recordTransaction.placeholder.customer', 'Select customer...')

  return (
    <Form
      className='Layer__RecordTransactionForm'
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
                inline={!isCreatingAccount}
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
              <form.Field
                name='counterparty'
                validators={{ onDynamic: ({ value }) => required(t('bankTransactions:recordTransaction.validation.counterparty_required', '{{label}} is required', { label: counterpartyLabel }))(value) }}
              >
                {field => (
                  <RecordTransactionFormField>
                    <RecordTransactionCounterpartySelector
                      variant={variant}
                      label={counterpartyLabel}
                      placeholder={counterpartyPlaceholder}
                      isInvalid={field.state.meta.errors.length > 0}
                      value={field.state.value}
                      onChange={field.handleChange}
                    />
                    <FieldErrors errors={field.state.meta.errors} />
                  </RecordTransactionFormField>
                )}
              </form.Field>

              <form.AppField
                name='date'
                validators={{ onDynamic: ({ value }) => required(t('bankTransactions:recordTransaction.validation.date_required', 'Date is required'))(value) }}
              >
                {field => (
                  <field.FormDateField label={t('bankTransactions:recordTransaction.label.date', 'Date')} inline />
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
                        label={t('bankTransactions:recordTransaction.label.amount', 'Amount')}
                        inline
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
                validators={{ onDynamic: ({ value }) => !isMultiSplit && required(t('bankTransactions:recordTransaction.validation.category_required', 'Category is required'))(value) }}
              >
                {field => (
                  <RecordTransactionFormField>
                    <RecordTransactionsFormCategoryCombobox
                      label={t('bankTransactions:recordTransaction.label.category', 'Category')}
                      placeholder={t('bankTransactions:recordTransaction.placeholder.category', 'Select category...')}
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
                          <Label size='sm'>{t('bankTransactions:recordTransaction.label.tax_code', 'Tax code')}</Label>
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
                  <field.FormTextField
                    label={t('bankTransactions:recordTransaction.label.memo', 'Memo')}
                    inline
                    placeholder={t('bankTransactions:recordTransaction.placeholder.memo', 'Add a note about this transaction...')}
                  />
                )}
              </form.AppField>
            </>
          )}
      </form.Subscribe>
    </Form>
  )
}
