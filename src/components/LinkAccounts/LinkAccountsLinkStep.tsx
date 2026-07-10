import { useContext } from 'react'
import { ChevronRight, Link } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { getBankAccountDisplayName, getBankAccountInstitution } from '@utils/bankAccount'
import { tPlural } from '@utils/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useBankAccountsContext } from '@contexts/BankAccountsContext/BankAccountsContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import { Button } from '@ui/Button/Button'
import { ElevatedLoadingSpinner, ElevatedLoadingSpinnerContainer } from '@ui/Loading/ElevatedLoadingSpinner'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { P } from '@ui/Typography/Text'
import { ActionableRow } from '@components/ActionableRow/ActionableRow'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { LinkAccountsListContainer } from '@components/LinkAccounts/LinkAccountsListContainer'
import { BasicLinkedAccountContainer, BasicLinkedAccountContent } from '@components/LinkedAccounts/BasicLinkedAccount/BasicLinkedAccount'
import { LinkAccountDemoTooltip } from '@components/LinkedAccounts/LinkAccountDemoTooltip'
import { Loader } from '@components/Loader/Loader'
import { Separator } from '@components/Separator/Separator'
import { ConditionalList } from '@components/utility/ConditionalList'
import { useWizard } from '@components/Wizard/Wizard'

export function LinkAccountsLinkStep() {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const { isLinking, addConnection } = useContext(LinkedAccountsContext)
  const { data, isError, refetch, loadingStatus } = useBankAccountsContext()
  const { business } = useLayerContext()
  const isDemoBusiness = business?.isDemo ?? false

  const { next } = useWizard()

  const effectiveAccounts = data ?? []

  return (
    <>
      <ElevatedLoadingSpinnerContainer>
        {isLinking && <ElevatedLoadingSpinner />}
        <ConditionalList
          list={effectiveAccounts}
          Empty={(
            <VStack gap='xl' pbe='md' align='start'>
              <P status='disabled'>
                {t('linkedAccounts:label.connect_bank_accounts_and_credit_cards', 'Connect your bank accounts and credit cards to automatically import your business transactions.')}
              </P>
              <LinkAccountDemoTooltip active={isDemoBusiness}>
                <Button
                  onClick={() => { void addConnection('PLAID') }}
                  isDisabled={isDemoBusiness || loadingStatus !== 'complete' || isLinking}
                >
                  {t('linkedAccounts:action.connect_my_bank', 'Connect my bank')}
                  <Link size={12} />
                </Button>
              </LinkAccountDemoTooltip>
            </VStack>
          )}
          Container={({ children }) => (
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
                <P status='disabled'>
                  {t('linkedAccounts:label.remove_unused_accounts_next_step', 'You’ll have the chance to remove any accounts you don’t use for your business in the next step.')}
                </P>
              </VStack>
              <LinkAccountsListContainer>
                {children}
              </LinkAccountsListContainer>
              <VStack pbs='xl'>
                <ActionableRow
                  title={t('linkedAccounts:prompt.use_other_bank_accounts_or_cards', 'Do you use any other bank accounts or credit cards for your business?')}
                  button={(
                    <LinkAccountDemoTooltip active={isDemoBusiness}>
                      <Button
                        onClick={() => { void addConnection('PLAID') }}
                        isDisabled={isDemoBusiness || loadingStatus !== 'complete' || isLinking}
                        variant='outlined'
                      >
                        {t('linkedAccounts:action.link_another_bank', 'Link another bank')}
                        <Link size={12} />
                      </Button>
                    </LinkAccountDemoTooltip>
                  )}
                />
              </VStack>
            </VStack>
          )}
          isError={isError}
          Error={(
            <DataState
              status={DataStateStatus.failed}
              title={t('linkedAccounts:error.load_accounts', 'Failed to load accounts')}
              description={t('common:error.please_try_again_later', 'Please try again later')}
              onRefresh={() => { void refetch() }}
            />
          )}
          isLoading={loadingStatus === 'loading' || loadingStatus === 'initial'}
          Loading={<Loader />}
        >
          {({ item: bankAccount }) => (
            <BasicLinkedAccountContainer key={bankAccount.id} isSelected>
              <BasicLinkedAccountContent account={{
                externalAccountName: getBankAccountDisplayName(bankAccount),
                mask: bankAccount.mask,
                institution: getBankAccountInstitution(bankAccount),
              }}
              />
            </BasicLinkedAccountContainer>
          )}
        </ConditionalList>
      </ElevatedLoadingSpinnerContainer>
      {effectiveAccounts.length > 0
        ? (
          <>
            <Separator mbs='lg' mbe='lg' />
            <HStack justify='start' gap='sm'>
              <Button onClick={() => { void next() }}>
                {t('linkedAccounts:action.im_done_linking', 'I’m done linking my banks')}
                <ChevronRight size={18} />
              </Button>
            </HStack>
          </>
        )
        : null}
    </>
  )
}
