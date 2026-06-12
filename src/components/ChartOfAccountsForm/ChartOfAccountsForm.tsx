import { useCallback, useContext, useEffect, useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import type React from 'react'
import { useTranslation } from 'react-i18next'

import { type LedgerAccountType, type LedgerEntryDirection, type NestedLedgerAccountType } from '@schemas/generalLedger/ledgerAccount'
import { UpsertLedgerAccountMode } from '@hooks/api/businesses/[business-id]/ledger/accounts/useUpsertLedgerAccount'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { ChartOfAccountsContext } from '@contexts/ChartOfAccountsContext/ChartOfAccountsContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Button } from '@ui/Button/Button'
import { CloseButton } from '@ui/Button/CloseButton'
import { Form } from '@ui/Form/Form'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { AccountSubtypeComboBox } from '@components/ChartOfAccountsForm/AccountSubtypeComboBox'
import { AccountTypeComboBox } from '@components/ChartOfAccountsForm/AccountTypeComboBox'
import { flattenAccounts } from '@components/ChartOfAccountsForm/flattenAccounts'
import { NormalityComboBox } from '@components/ChartOfAccountsForm/NormalityComboBox'
import { ParentComboBox } from '@components/ChartOfAccountsForm/ParentComboBox'
import { useChartOfAccountsForm } from '@components/ChartOfAccountsForm/useChartOfAccountsForm'
import { DataState, DataStateStatus } from '@components/DataState/DataState'

import './chartOfAccountsForm.scss'

export type ChartOfAccountsFormMode =
  | { action: 'new' }
  | { action: 'edit', accountId: string }

export interface ChartOfAccountsFormStringOverrides {
  editModeHeader?: string
  createModeHeader?: string
  cancelButton?: string
  saveButton?: string
  retryButton?: string
  parentLabel?: string
  nameLabel?: string
  accountNumberLabel?: string
  typeLabel?: string
  subTypeLabel?: string
  normalityLabel?: string
}

type ChartOfAccountsFormContentMode =
  | { mode: UpsertLedgerAccountMode.Create }
  | { mode: UpsertLedgerAccountMode.Update, account: NestedLedgerAccountType, parentAccountId?: string }

type ChartOfAccountsFormContentProps = ChartOfAccountsFormContentMode & {
  onCancel: () => void
  stringOverrides?: ChartOfAccountsFormStringOverrides
}

const ChartOfAccountsFormContent = (props: ChartOfAccountsFormContentProps) => {
  const { onCancel, stringOverrides } = props
  const { t } = useTranslation()
  const { data } = useContext(ChartOfAccountsContext)
  const { accountingConfiguration } = useLayerContext()
  const enableAccountNumbers = !!accountingConfiguration?.enableAccountNumbers
  const { isMobile } = useSizeClass()
  const inline = !isMobile

  const cancelLabel = stringOverrides?.cancelButton || t('common:action.cancel_label', 'Cancel')

  const isEdit = props.mode === UpsertLedgerAccountMode.Update
  const account = props.mode === UpsertLedgerAccountMode.Update ? props.account : undefined

  const { form, submitError } = useChartOfAccountsForm(
    props.mode === UpsertLedgerAccountMode.Update
      ? { mode: UpsertLedgerAccountMode.Update, account: props.account, parentAccountId: props.parentAccountId, onSuccess: onCancel }
      : { mode: UpsertLedgerAccountMode.Create, onSuccess: onCancel },
  )

  const allAccounts = useMemo(() => flattenAccounts(data?.accounts ?? []), [data?.accounts])

  /* When setting the parent field, inherit the parent's type, sub-type, and normality */
  const onChangeParent = useCallback((value: string | null) => {
    form.setFieldValue('parent', value)

    const foundParent = value
      ? allAccounts.find(accountItem => accountItem.accountId === value)
      : undefined

    if (foundParent) {
      form.setFieldValue('type', foundParent.accountType.value)
      form.setFieldValue('subType', foundParent.accountSubtype?.value ?? null)
      form.setFieldValue('normality', foundParent.normality)
    }
  }, [allAccounts, form])

  // Prevents default browser form submission behavior since we're handling submission externally.
  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <Form className='Layer__ChartOfAccountsForm' onSubmit={blockNativeOnSubmit}>
      <HStack className='Layer__ChartOfAccountsForm__Header' justify='space-between' align='center' gap='md'>
        <Heading level={3} size='sm'>
          {isEdit
            ? stringOverrides?.editModeHeader || t('chartOfAccounts:action.edit_account', 'Edit Account')
            : stringOverrides?.createModeHeader || t('chartOfAccounts:action.add_new_account', 'Add New Account')}
        </Heading>
        <CloseButton onPress={onCancel} />
      </HStack>

      {submitError && (
        <HStack className='Layer__ChartOfAccountsForm__FormError' pb='sm' pi='md'>
          <DataState
            icon={<AlertTriangle size={16} />}
            status={DataStateStatus.failed}
            title={submitError}
            titleSize='md'
            inline
          />
        </HStack>
      )}

      {account && (
        <HStack className='Layer__ChartOfAccountsForm__EditEntry' justify='space-between' align='center' gap='md'>
          <Span weight='bold'>{account.name}</Span>
          <MoneySpan weight='bold' amount={account.balance} />
        </HStack>
      )}

      <VStack className='Layer__ChartOfAccountsForm__Section' gap='sm'>
        <form.Field name='parent'>
          {field => (
            <ParentComboBox
              label={stringOverrides?.parentLabel || t('chartOfAccounts:label.parent', 'Parent')}
              data={data}
              value={field.state.value}
              onChange={onChangeParent}
              error={field.state.meta.errors[0] as string | undefined}
              inline={inline}
            />
          )}
        </form.Field>

        <form.AppField name='name'>
          {field => (
            <field.FormTextField
              label={stringOverrides?.nameLabel || t('common:label.name', 'Name')}
              placeholder={t('chartOfAccounts:label.enter_name', 'Enter name...')}
              inline={inline}
            />
          )}
        </form.AppField>

        {enableAccountNumbers && (
          <form.AppField name='accountNumber'>
            {field => (
              <field.FormTextField
                label={stringOverrides?.accountNumberLabel || t('generalLedger:label.account_number', 'Account Number')}
                placeholder={t('chartOfAccounts:label.enter_account_number', 'Enter account number...')}
                inline={inline}
              />
            )}
          </form.AppField>
        )}

        <form.Subscribe selector={state => state.values.parent}>
          {parent => (
            <form.Field name='type'>
              {field => (
                <AccountTypeComboBox
                  label={stringOverrides?.typeLabel || t('common:label.type', 'Type')}
                  value={field.state.value}
                  onChange={value => field.handleChange(value as LedgerAccountType | null)}
                  isDisabled={isEdit || parent !== null}
                  error={field.state.meta.errors[0] as string | undefined}
                  inline={inline}
                />
              )}
            </form.Field>
          )}
        </form.Subscribe>

        <form.Subscribe selector={state => state.values.type}>
          {type => (
            <form.Field name='subType'>
              {field => (
                <AccountSubtypeComboBox
                  label={stringOverrides?.subTypeLabel || t('chartOfAccounts:label.sub_type', 'Sub-Type')}
                  type={type}
                  value={field.state.value}
                  onChange={field.handleChange}
                  error={field.state.meta.errors[0] as string | undefined}
                  inline={inline}
                />
              )}
            </form.Field>
          )}
        </form.Subscribe>

        <form.Field name='normality'>
          {field => (
            <NormalityComboBox
              label={stringOverrides?.normalityLabel || t('common:label.normality', 'Normality')}
              value={field.state.value}
              onChange={value => field.handleChange(value as LedgerEntryDirection | null)}
              error={field.state.meta.errors[0] as string | undefined}
              inline={inline}
            />
          )}
        </form.Field>
      </VStack>

      <HStack className='Layer__ChartOfAccountsForm__Footer' justify='end' align='center' gap='xs'>
        <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <>
              <Button variant='outlined' onPress={onCancel} isDisabled={isSubmitting}>
                {cancelLabel}
              </Button>
              <Button isDisabled={!canSubmit} isPending={isSubmitting} onPress={() => { void form.handleSubmit() }}>
                {submitError
                  ? stringOverrides?.retryButton || t('common:action.retry_label', 'Retry')
                  : stringOverrides?.saveButton || t('common:action.save_label', 'Save')}
              </Button>
            </>
          )}
        </form.Subscribe>
      </HStack>
    </Form>
  )
}

export const ChartOfAccountsForm = ({
  formMode,
  onCancel,
  stringOverrides,
}: {
  formMode?: ChartOfAccountsFormMode
  onCancel: () => void
  stringOverrides?: ChartOfAccountsFormStringOverrides
}) => {
  const { data, isLoading } = useContext(ChartOfAccountsContext)

  const contentProps = useMemo((): ChartOfAccountsFormContentMode | undefined => {
    if (!formMode) return undefined
    if (formMode.action === 'new') return { mode: UpsertLedgerAccountMode.Create }

    const allAccounts = flattenAccounts(data?.accounts ?? [])
    const account = allAccounts.find(accountItem => accountItem.accountId === formMode.accountId)
    if (!account) return undefined

    const parentAccountId = allAccounts.find(
      accountItem => accountItem.subAccounts?.some(child => child.accountId === account.accountId),
    )?.accountId

    return { mode: UpsertLedgerAccountMode.Update, account, parentAccountId }
  }, [data?.accounts, formMode])

  // If an account being edited drops out of the loaded data after the panel opened
  // (e.g. it's deleted, or a refetch returns a different set), close the form once
  // the data has settled rather than leaving the panel open with nothing to render.
  const isMissingEditTarget = formMode?.action === 'edit' && !contentProps && !isLoading
  useEffect(() => {
    if (isMissingEditTarget) {
      onCancel()
    }
  }, [isMissingEditTarget, onCancel])

  if (!contentProps) {
    return null
  }

  return (
    <ChartOfAccountsFormContent
      key={contentProps.mode === UpsertLedgerAccountMode.Update ? contentProps.account.accountId : 'new'}
      {...contentProps}
      onCancel={onCancel}
      stringOverrides={stringOverrides}
    />
  )
}
