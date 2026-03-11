import { useContext } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { i18nextPlural } from '@utils/i18n/plural'
import { useConfirmAndExcludeMultiple } from '@hooks/features/bankAccounts/useConfirmAndExcludeMultiple'
import { getAccountsNeedingConfirmation } from '@hooks/legacy/useLinkedAccounts'
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

function getSubmitButtonText({
  totalCount,
  confirmedCount,
}: { totalCount: number, confirmedCount: number }) {
  if (confirmedCount === totalCount) {
    return i18nextPlural('confirmAllAccounts', {
      count: totalCount,
      one: 'Confirm Account',
      other: 'Confirm All Accounts',
    })
  }

  if (confirmedCount === 0) {
    return i18nextPlural('excludeAllAccounts', {
      count: totalCount,
      one: 'Exclude Account',
      other: 'Exclude All Accounts',
    })
  }

  return i18nextPlural('confirmSelectedAccounts', {
    count: confirmedCount,
    one: 'Confirm {{count}} Selected Account',
    other: 'Confirm {{count}} Selected Accounts',
  })
}

function AccountConfirmationEmptyList() {
  const { t } = useTranslation()
  const CLASS_NAME = 'Layer__AccountConfirmationEmptyList'

  return (
    <div className={CLASS_NAME}>
      <VStack slot='center' gap='xs'>
        <Heading size='sm' align='center'>{t('accountsSuccessfullyLinked', 'Accounts Successfully Linked')}</Heading>
        <P variant='subtle' align='center'>{t('youCanLinkMoreAccountsAtAnyTimeFromTheBankTransactionsSection', 'You can link more accounts at any time from the Bank Transactions section')}</P>
      </VStack>
    </div>
  )
}

export function LinkAccountsConfirmationStep() {
  const { t } = useTranslation()
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

  return (
    <VStack gap='lg'>
      <VStack gap='2xs'>
        <Heading level={3} size='sm'>
          {t('whichAccountsDoYouUseForBusiness', 'Which accounts do you use for businesses?')}
        </Heading>
        <P variant='subtle'>
          {t('pleaseDeselectAnyAccountsYouDontUseForYourBusiness', 'Please deselect any accounts you don\'t use for your business.')}
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
          {t('back', 'Back')}
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
              {getSubmitButtonText({
                totalCount,
                confirmedCount: selectedCount,
              })}
            </Button>
          )}
        </Subscribe>
      </HStack>
    </VStack>
  )
}
