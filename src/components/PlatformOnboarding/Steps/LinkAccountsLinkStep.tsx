import { useContext } from 'react'
import { LinkedAccountsContext } from '../../../contexts/LinkedAccountsContext'
import { Loader } from '../../Loader'
import { DataState, DataStateStatus } from '../../DataState'
import LinkIcon from '../../../icons/Link'
import { Button } from '../../Button'
import { ConditionalList } from '../../utility/ConditionalList'
import { HStack, VStack } from '../../ui/Stack/Stack'
import { useWizard } from '../../Wizard/Wizard'
import { BasicLinkedAccountContainer, BasicLinkedAccountContent } from '../../LinkedAccounts/BasicLinkedAccount/BasicLinkedAccount'
import { LinkAccountsListContainer } from '../Container/LinkAccountsListContainer'
import { P } from '../../ui/Typography/Text'
import { Heading } from '../../ui/Typography/Heading'

export function LinkAccountsLinkStep() {
  const {
    data,
    loadingStatus,
    error,
    refetchAccounts,
    addConnection,
  } = useContext(LinkedAccountsContext)

  const { next } = useWizard()

  const effectiveAccounts = data ?? []

  return (
    <>
      <ConditionalList
        list={effectiveAccounts}
        Empty={(
          <VStack gap='2xs' pbe='md'>
            <P variant='subtle' size='lg'>
              Connect your business bank accounts and credit cards to automatically import your business transactions.
            </P>
            <HStack pbs='lg' justify='center'>
              <Button
                onClick={() => { addConnection('PLAID') }}
                rightIcon={<LinkIcon size={12} />}
                disabled={loadingStatus !== 'complete'}
              >
                Connect my bank
              </Button>
            </HStack>
          </VStack>
        )}
        Container={({ children }) => (
          <VStack>
            <VStack gap='2xs' pbe='md'>
              <Heading level={3} size='sm'>
                We&apos;ve found the below accounts
              </Heading>
              <P variant='subtle'>
                You&apos;ll have the chance to remove any accounts you don&apos;t use for your business in the next step.
              </P>
            </VStack>
            <LinkAccountsListContainer>
              {children}
            </LinkAccountsListContainer>
            <VStack pbs='xl' gap='sm'>
              <Heading level={3} align='center'>
                Do you use any other bank accounts or credit cards for your business?
              </Heading>
              <HStack justify='center'>
                <Button
                  onClick={() => { addConnection('PLAID') }}
                  rightIcon={<LinkIcon size={12} />}
                  disabled={loadingStatus !== 'complete'}
                >
                  Link another bank
                </Button>
              </HStack>
            </VStack>
          </VStack>
        )}
        isError={Boolean(error)}
        Error={(
          <DataState
            status={DataStateStatus.failed}
            title='Failed to load accounts'
            description='Please try again later'
            onRefresh={() => { void refetchAccounts() }}
          />
        )}
        isLoading={loadingStatus === 'loading' || loadingStatus === 'initial'}
        Loading={<Loader />}
      >
        {({ item: account }) => (
          <BasicLinkedAccountContainer key={account.id} isSelected>
            <BasicLinkedAccountContent account={account} />
          </BasicLinkedAccountContainer>
        )}
      </ConditionalList>
      {effectiveAccounts.length > 0
        ? (
          <HStack pbs='lg' justify='end' gap='sm'>
            <Button onClick={() => { void next() }}>
              I’m done connecting my business accounts
            </Button>
          </HStack>
        )
        : null}
    </>
  )
}
