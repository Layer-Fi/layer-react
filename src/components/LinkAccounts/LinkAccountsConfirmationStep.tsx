import { useCallback, useContext } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'
import { useConfirmAndExcludeMultiple } from '@hooks/features/bankAccounts/useConfirmAndExcludeMultiple'
import { getAccountsNeedingConfirmation } from '@hooks/legacy/useLinkedAccounts'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { P } from '@ui/Typography/Text'
import { Button, ButtonVariant } from '@components/Button/Button'
import { LinkAccountsListContainer } from '@components/LinkAccounts/LinkAccountsListContainer'
import { LinkedAccountToConfirm } from '@components/LinkedAccounts/ConfirmationModal/LinkedAccountToConfirm'
import { ConditionalList } from '@components/utility/ConditionalList'
import { useWizard } from '@components/Wizard/Wizard'

import './linkAccountsConfirmationStep.scss'

function AccountConfirmationEmptyList() {
  const { t } = useTranslation()
  const CLASS_NAME = 'Layer__AccountConfirmationEmptyList'

  return (
    <div className={CLASS_NAME}>
      <VStack slot='center' gap='xs'>
        <Heading size='sm' align='center'>{t('linkedAccounts:label.accounts_successfully_linked', 'Accounts Successfully Linked')}</Heading>
        <P variant='subtle' align='center'>{t('linkedAccounts:label.link_more_accounts_any_time', 'You can link more accounts at any time from the Bank Transactions section')}</P>
      </VStack>
    </div>
  )
}

export function LinkAccountsConfirmationStep() {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const {
    data: linkedAccounts,
    loadingStatus: linkedAccountsLoadingStatus,
    refetchAccounts,
  } = useContext(LinkedAccountsContext)

  const effectiveLinkedAccounts = linkedAccounts
    ? getAccountsNeedingConfirmation(linkedAccounts)
    : []

  const { trigger } = useConfirmAndExcludeMultiple({ onSuccess: refetchAccounts })

  const { previous, next } = useWizard()

  const {
    Field,
    Subscribe,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    handleSubmit,
  } = useForm({
    defaultValues: {
      accounts: effectiveLinkedAccounts.map(account => ({ account, isSelected: true })),
    },
    onSubmit: async ({ value }) => {
      const formattedArg = Object.fromEntries(
        value.accounts.map(({ account, isSelected }) => [account.id, isSelected]),
      )

      await trigger(formattedArg)
      await next()
    },
  })

  const getSubmitButtonText = useCallback((
    { totalCount, confirmedCount }: { totalCount: number, confirmedCount: number },
  ) => {
    if (confirmedCount === totalCount) {
      return tPlural(t, 'linkedAccounts:action.confirm_accounts', {
        count: totalCount,
        one: 'Confirm Account',
        other: 'Confirm All Accounts',
      })
    }

    if (confirmedCount === 0) {
      return tPlural(t, 'linkedAccounts:action.exclude_all_accounts', {
        count: totalCount,
        one: 'Exclude Account',
        other: 'Exclude All Accounts',
      })
    }

    return tPlural(t, 'linkedAccounts:action.confirm_accounts_selected', {
      count: confirmedCount,
      displayCount: formatNumber(confirmedCount),
      one: 'Confirm {{displayCount}} Selected Account',
      other: 'Confirm {{displayCount}} Selected Accounts',
    })
  }, [formatNumber, t])

  return (
    <VStack gap='lg'>
      <VStack gap='2xs'>
        <Heading level={3} size='sm'>
          {t('linkedAccounts:prompt.which_accounts_for_business', 'Which accounts do you use for businesses?')}
        </Heading>
        <P variant='subtle'>
          {t('linkedAccounts:label.deselect_unused_accounts', 'Please deselect any accounts you don\'t use for your business.')}
        </P>
      </VStack>
      <Field name='accounts' mode='array'>
        {({ state: { value } }) => (
          <ConditionalList
            list={value}
            Empty={<AccountConfirmationEmptyList />}
            Container={LinkAccountsListContainer}
          >
            {({ item: { account }, index }) => (
              <Field key={index} name={`accounts[${index}].isSelected`}>
                {({ state: { value: isSelected }, handleChange }) => (
                  <LinkedAccountToConfirm
                    key={account.id}
                    account={account}
                    isConfirmed={isSelected}
                    onChangeConfirmed={handleChange}
                  />
                )}
              </Field>
            )}
          </ConditionalList>
        )}
      </Field>
      <HStack pbs='lg' gap='sm'>
        <Button variant={ButtonVariant.secondary} onClick={previous}>
          {t('common:action.back', 'Back')}
        </Button>
        <Subscribe
          selector={({ isSubmitting, values }) => ({
            isSubmitting,
            totalCount: values.accounts.length,
            selectedCount: values.accounts.filter(({ isSelected }) => isSelected).length,
          })}
        >
          {({ isSubmitting, totalCount, selectedCount }) => (
            <Button
              onClick={() => { void handleSubmit() }}
              disabled={isSubmitting || linkedAccountsLoadingStatus !== 'complete'}
            >
              {getSubmitButtonText({ totalCount, confirmedCount: selectedCount })}
            </Button>
          )}
        </Subscribe>
      </HStack>
    </VStack>
  )
}
