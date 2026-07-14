import { type PropsWithChildren, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { positiveAmount, required } from '@utils/form/validators'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Form } from '@ui/Form/Form'
import { RecordTransactionCounterpartySelector } from '@components/BankTransactions/RecordManualTransaction/RecordTransactionCounterpartySelector'
import { type RecordTransactionFormApi, type RecordTransactionVariant } from '@components/BankTransactions/RecordManualTransaction/useRecordTransactionForm'
import { CustomAccountComboBox, isNewAccountOption } from '@components/CustomAccountComboBox/CustomAccountComboBox'
import { LedgerAccountCombobox } from '@components/LedgerAccountCombobox/LedgerAccountCombobox'
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
}

export function RecordTransactionForm({ form, variant }: RecordTransactionFormProps) {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const isExpense = variant === 'expense'

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
                name='amount'
                validators={{ onDynamic: ({ value }) => positiveAmount(t('bankTransactions:recordTransaction.validation.amount_greater_than_zero', 'Amount must be greater than zero'))(value) }}
              >
                {field => (
                  <field.FormNonRecursiveBigDecimalField
                    label={t('bankTransactions:recordTransaction.label.amount', 'Amount')}
                    inline
                    mode='currency'
                    placeholder={formatCurrencyFromCents(0)}
                  />
                )}
              </form.AppField>

              <form.AppField
                name='date'
                validators={{ onDynamic: ({ value }) => required(t('bankTransactions:recordTransaction.validation.date_required', 'Date is required'))(value) }}
              >
                {field => (
                  <field.FormDateField label={t('bankTransactions:recordTransaction.label.date', 'Date')} inline />
                )}
              </form.AppField>

              <form.Field
                name='category'
                validators={{ onDynamic: ({ value }) => required(t('bankTransactions:recordTransaction.validation.category_required', 'Category is required'))(value) }}
              >
                {field => (
                  <RecordTransactionFormField>
                    <LedgerAccountCombobox
                      label={t('bankTransactions:recordTransaction.label.category', 'Category')}
                      placeholder={t('bankTransactions:recordTransaction.placeholder.category', 'Select category...')}
                      showLabel
                      inline
                      isInvalid={field.state.meta.errors.length > 0}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    />
                    <FieldErrors errors={field.state.meta.errors} />
                  </RecordTransactionFormField>
                )}
              </form.Field>

              <form.AppField name='memo'>
                {field => (
                  <field.FormTextField
                    label={t('bankTransactions:recordTransaction.label.description', 'Description')}
                    inline
                    placeholder={t('bankTransactions:recordTransaction.placeholder.description', 'Add a note about this transaction...')}
                  />
                )}
              </form.AppField>
            </>
          )}
      </form.Subscribe>
    </Form>
  )
}
