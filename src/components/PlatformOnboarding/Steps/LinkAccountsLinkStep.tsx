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
import { Heading } from '../../ui/Typography/Heading'
import { Text } from '../../Typography/Text'
import pluralize from 'pluralize'
import ChevronRight from '../../../icons/ChevronRight'
import { ActionableRow } from '../../ActionableRow/ActionableRow'
import PlaidIcon from '../../../icons/PlaidIcon'
import { Separator } from '../../Separator/Separator'

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
          <VStack gap='xl' pbe='md'>
            <Text status='disabled'>
              Connect your bank accounts and credit cards to automatically import your business transactions.
            </Text>
            <ActionableRow
              iconBox={<PlaidIcon />}
              title='Connect my bank'
              description='Import data with one simple integration.'
              button={(
                <Button
                  onClick={() => addConnection('PLAID')}
                  rightIcon={<LinkIcon size={12} />}
                  disabled={loadingStatus !== 'complete'}
                >
                  Connect
                </Button>
              )}
            />
          </VStack>
        )}
        Container={({ children }) => (
          <VStack>
            <VStack gap='2xs' pbe='md'>
              <Heading level={3} size='sm'>
                {`We've found ${pluralize('account', effectiveAccounts.length, true)}`}
              </Heading>
              <Text status='disabled'>
                {'You\'ll have the chance to remove any accounts you don\'t use for your business in the next step.'}
              </Text>
            </VStack>
            <LinkAccountsListContainer>
              {children}
            </LinkAccountsListContainer>
            <VStack pbs='xl'>
              <ActionableRow
                iconBox={<PlaidIcon />}
                title='Connect my next bank account'
                description='Import data with one simple integration.'
                button={(
                  <Button
                    onClick={() => addConnection('PLAID')}
                    rightIcon={<LinkIcon size={12} />}
                    disabled={loadingStatus !== 'complete'}
                  >
                    Connect next
                  </Button>
                )}
              />
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
          <>
            <Separator mbs='lg' mbe='lg' />
            <HStack justify='start' gap='sm'>
              <Button onClick={() => { void next() }} rightIcon={<ChevronRight />}>
                I’m done linking my banks
              </Button>
            </HStack>
          </>
        )
        : null}
    </>
  )
}
