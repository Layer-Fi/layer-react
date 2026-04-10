import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { getBankAccountDisplayName, getBankAccountInstitution } from '@utils/bankAccount'
import { tPlural } from '@utils/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import ChevronRight from '@icons/ChevronRight'
import LinkIcon from '@icons/Link'
import { Button } from '@ui/Button/Button'
import { ElevatedLoadingSpinner, ElevatedLoadingSpinnerContainer } from '@ui/Loading/ElevatedLoadingSpinner'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { ActionableRow } from '@components/ActionableRow/ActionableRow'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { LinkAccountsListContainer } from '@components/LinkAccounts/LinkAccountsListContainer'
import { BasicLinkedAccountContainer, BasicLinkedAccountContent } from '@components/LinkedAccounts/BasicLinkedAccount/BasicLinkedAccount'
import { Loader } from '@components/Loader/Loader'
import { Separator } from '@components/Separator/Separator'
import { Text } from '@components/Typography/Text'
import { ConditionalList } from '@components/utility/ConditionalList'
import { useWizard } from '@components/Wizard/Wizard'

export function LinkAccountsLinkStep() {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const {
    data,
    loadingStatus,
    isLinking,
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
          <ElevatedLoadingSpinnerContainer>
            {isLinking && <ElevatedLoadingSpinner />}
            <VStack gap='xl' pbe='md'>
              <Text status='disabled'>
                {t('linkedAccounts:label.connect_bank_accounts_and_credit_cards', 'Connect your bank accounts and credit cards to automatically import your business transactions.')}
              </Text>
              <Button
                onClick={() => { void addConnection('PLAID') }}
                isDisabled={loadingStatus !== 'complete' || isLinking}
              >
                {t('linkedAccounts:action.connect_my_bank', 'Connect my bank')}
                <LinkIcon size={12} />
              </Button>
            </VStack>
          </ElevatedLoadingSpinnerContainer>
        )}
        Container={({ children }) => (
          <ElevatedLoadingSpinnerContainer>
            {isLinking && <ElevatedLoadingSpinner />}
            <VStack>
              <VStack gap='2xs' pbe='md'>
                <Heading level={3} size='sm'>
                  {tPlural(t, 'linkedAccounts:label.found_accounts_count', {
                    count: effectiveAccounts.length,
                    displayCount: formatNumber(effectiveAccounts.length),
                    one: 'We’ve found {{displayCount}} account',
                    other: 'We’ve found {{displayCount}} accounts',
                  })}
                </Heading>
                <Text status='disabled'>
                  {t('linkedAccounts:label.remove_unused_accounts_next_step', 'You’ll have the chance to remove any accounts you don’t use for your business in the next step.')}
                </Text>
              </VStack>
              <LinkAccountsListContainer>
                {children}
              </LinkAccountsListContainer>
              <VStack pbs='xl'>
                <ActionableRow
                  title={t('linkedAccounts:prompt.use_other_bank_accounts_or_cards', 'Do you use any other bank accounts or credit cards for your business?')}
                  button={(
                    <Button
                      onClick={() => { void addConnection('PLAID') }}
                      isDisabled={loadingStatus !== 'complete' || isLinking}
                      variant='outlined'
                    >
                      {t('linkedAccounts:action.link_another_bank', 'Link another bank')}
                      <LinkIcon size={12} />
                    </Button>
                  )}
                />
              </VStack>
            </VStack>
          </ElevatedLoadingSpinnerContainer>
        )}
        isError={!!(error)}
        Error={(
          <DataState
            status={DataStateStatus.failed}
            title={t('linkedAccounts:error.load_accounts', 'Failed to load accounts')}
            description={t('common:error.please_try_again_later', 'Please try again later')}
            onRefresh={() => { void refetchAccounts() }}
          />
        )}
        isLoading={loadingStatus === 'loading' || loadingStatus === 'initial'}
        Loading={<Loader />}
      >
        {({ item: bankAccount }) => (
          <BasicLinkedAccountContainer key={bankAccount.id} isSelected>
            <BasicLinkedAccountContent account={{
              external_account_name: getBankAccountDisplayName(bankAccount),
              mask: bankAccount.mask,
              institution: getBankAccountInstitution(bankAccount),
            }}
            />
          </BasicLinkedAccountContainer>
        )}
      </ConditionalList>
      {effectiveAccounts.length > 0
        ? (
          <>
            <Separator mbs='lg' mbe='lg' />
            <HStack justify='start' gap='sm'>
              <Button onClick={() => { void next() }}>
                {t('linkedAccounts:action.im_done_linking', 'I’m done linking my banks')}
                <ChevronRight />
              </Button>
            </HStack>
          </>
        )
        : null}
    </>
  )
}
