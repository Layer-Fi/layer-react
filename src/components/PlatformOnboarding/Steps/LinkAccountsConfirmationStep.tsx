import { useContext } from 'react'
import { HStack, VStack } from '../../ui/Stack/Stack'
import { Heading } from '../../ui/Typography/Heading'
import { P } from '../../ui/Typography/Text'
import { LinkedAccountsContext } from '../../../contexts/LinkedAccountsContext'
import { ConditionalList } from '../../utility/ConditionalList'
import { LinkedAccountToConfirm } from '../../LinkedAccounts/ConfirmationModal/LinkedAccountToConfirm'
import { useForm } from '@tanstack/react-form'
import { Button, ButtonVariant } from '../../Button'
import { useWizard } from '../../Wizard/Wizard'
import { useConfirmAndExcludeMultiple } from '../../LinkedAccounts/ConfirmationModal/useConfirmAndExcludeMultiple'
import { LinkAccountsListContainer } from '../Container/LinkAccountsListContainer'
import { getAccountsNeedingConfirmation } from '../../../hooks/useLinkedAccounts/useLinkedAccounts'

function getSubmitButtonText({
  totalCount,
  confirmedCount,
}: { totalCount: number, confirmedCount: number }) {
  if (confirmedCount === totalCount) {
    return totalCount > 1
      ? 'Confirm All Accounts'
      : 'Confirm Account'
  }

  if (confirmedCount === 0) {
    return totalCount > 1
      ? 'Exclude All Accounts'
      : 'Exclude Account'
  }

  return `Confirm ${confirmedCount} Selected Account${confirmedCount > 1 ? 's' : ''}`
}

function AccountConfirmationEmptyList() {
  const CLASS_NAME = 'Layer__AccountConfirmationEmptyList'

  return (
    <div className={CLASS_NAME}>
      <VStack slot='center' gap='xs'>
        <Heading size='sm' align='center'>Accounts Successfully Linked</Heading>
        <P variant='subtle' align='center'>You can link more accounts at any time from the Bank Transactions section</P>
      </VStack>
    </div>
  )
}

export function LinkAccountsConfirmationStep() {
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
          Which accounts do you use for businesses?
        </Heading>
        <P variant='subtle'>
          {'Please unselect any accounts you don\'t use for your business.'}
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
          Back
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
