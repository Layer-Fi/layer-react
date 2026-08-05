import { useContext } from 'react'
import { ChevronRight, Link } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { getBankAccountDisplayName, getBankAccountInstitution } from '@utils/features/bankAccounts/bankAccount'
import { tPlural } from '@utils/shared/i18n/plural'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useBankAccountsContext } from '@providers/features/bankAccounts/BankAccountsContext/BankAccountsContext'
import { LinkedAccountsContext } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsContext'
import { ConditionalList } from '@components/utility/ConditionalList'
import { Button } from '@ui/Button/Button'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { Loader } from '@ui/Loader/Loader'
import { ElevatedLoadingSpinner, ElevatedLoadingSpinnerContainer } from '@ui/Loading/ElevatedLoadingSpinner'
import { Separator } from '@ui/Separator/Separator'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { P } from '@ui/Typography/Text'
import { ActionableRow } from '@blocks/ActionableRow/ActionableRow'
import { useWizard } from '@blocks/Wizard/Wizard'
import { LinkAccountDemoTooltip } from '@features/linkedAccounts/LinkAccountDemoTooltip/LinkAccountDemoTooltip'
import { LinkAccountsListContainer } from '@features/linkedAccounts/LinkAccountsListContainer/LinkAccountsListContainer'
import { LinkedAccountRowContainer, LinkedAccountRowContent } from '@features/linkedAccounts/LinkedAccountRow/LinkedAccountRow'

export interface LinkAccountsStringOverrides {
  removeUnusedAccountsNextStep?: string
}

type LinkAccountsLinkStepProps = {
  isReconnectFlow?: boolean
  stringOverrides?: LinkAccountsStringOverrides
}

export function LinkAccountsLinkStep({ isReconnectFlow = false, stringOverrides }: LinkAccountsLinkStepProps) {
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
            <VStack gap='xl' align='start'>
              <P status='disabled'>
                {isReconnectFlow
                  ? t('linkedAccounts:LinkAccounts.label.reconnect_bank_accounts_and_credit_cards_description', 'Reconnect your bank accounts and credit cards to automatically import your business transactions.')
                  : t('linkedAccounts:LinkAccounts.label.connect_bank_accounts_and_credit_cards', 'Connect your bank accounts and credit cards to automatically import your business transactions.')}
              </P>
              <LinkAccountDemoTooltip active={isDemoBusiness}>
                <Button
                  onClick={() => { void addConnection('PLAID') }}
                  isDisabled={isDemoBusiness || loadingStatus !== 'complete' || isLinking}
                >
                  {isReconnectFlow
                    ? t('linkedAccounts:LinkAccounts.action.reconnect_my_accounts', 'Reconnect My Accounts')
                    : t('linkedAccounts:LinkAccounts.action.connect_my_bank', 'Connect my bank')}
                  <Link size={12} />
                </Button>
              </LinkAccountDemoTooltip>
            </VStack>
          )}
          Container={({ children }) => (
            <VStack>
              <VStack gap='2xs' pbe='md'>
                <Heading level={3} size='sm'>
                  {isReconnectFlow
                    ? tPlural(t, 'linkedAccounts:LinkAccounts.label.connected_accounts_count', {
                      count: effectiveAccounts.length,
                      displayCount: formatNumber(effectiveAccounts.length),
                      one: 'You’ve connected {{displayCount}} account',
                      other: 'You’ve connected {{displayCount}} accounts',
                    })
                    : tPlural(t, 'linkedAccounts:LinkAccounts.label.found_accounts_count', {
                      count: effectiveAccounts.length,
                      displayCount: formatNumber(effectiveAccounts.length),
                      one: 'We’ve found {{displayCount}} account',
                      other: 'We’ve found {{displayCount}} accounts',
                    })}
                </Heading>
                <P status='disabled'>
                  {isReconnectFlow
                    ? t('linkedAccounts:LinkAccounts.label.remove_accounts_new_dashboard', 'You’ll have the chance to remove any accounts in the new dashboard.')
                    : stringOverrides?.removeUnusedAccountsNextStep
                      ?? t('linkedAccounts:LinkAccounts.label.remove_unused_accounts_next_step', 'You’ll have the chance to remove any accounts you don’t use for your business in the next step.')}
                </P>
              </VStack>
              <LinkAccountsListContainer>
                {children}
              </LinkAccountsListContainer>
              <VStack pbs='xl'>
                <ActionableRow
                  title={isReconnectFlow
                    ? t('linkedAccounts:LinkAccounts.prompt.connect_all_bank_accounts_for_bookkeeping', 'Please connect all your bank accounts for bookkeeping')
                    : t('linkedAccounts:LinkAccounts.prompt.use_other_bank_accounts_or_cards', 'Do you use any other bank accounts or credit cards for your business?')}
                  button={(
                    <LinkAccountDemoTooltip active={isDemoBusiness}>
                      <Button
                        onClick={() => { void addConnection('PLAID') }}
                        isDisabled={isDemoBusiness || loadingStatus !== 'complete' || isLinking}
                        variant={isReconnectFlow ? 'solid' : 'outlined'}
                      >
                        {isReconnectFlow
                          ? t('linkedAccounts:LinkAccounts.action.reconnect_another_bank', 'Reconnect another bank')
                          : t('linkedAccounts:LinkAccounts.action.link_another_bank', 'Link another bank')}
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
              title={t('linkedAccounts:LinkAccounts.error.load_accounts', 'Failed to load accounts')}
              description={t('common:error.please_try_again_later', 'Please try again later')}
              onRefresh={() => { void refetch() }}
            />
          )}
          isLoading={loadingStatus === 'loading' || loadingStatus === 'initial'}
          Loading={<Loader />}
        >
          {({ item: bankAccount }) => (
            <LinkedAccountRowContainer key={bankAccount.id} isSelected>
              <LinkedAccountRowContent account={{
                externalAccountName: getBankAccountDisplayName(bankAccount),
                mask: bankAccount.mask,
                institution: getBankAccountInstitution(bankAccount),
              }}
              />
            </LinkedAccountRowContainer>
          )}
        </ConditionalList>
      </ElevatedLoadingSpinnerContainer>
      {!isReconnectFlow && effectiveAccounts.length > 0
        ? (
          <>
            <Separator mbs='lg' mbe='lg' />
            <HStack justify='start' gap='sm'>
              <Button onClick={() => { void next() }}>
                {t('linkedAccounts:LinkAccounts.action.im_done_linking', 'I’m done linking my banks')}
                <ChevronRight size={18} />
              </Button>
            </HStack>
          </>
        )
        : null}
    </>
  )
}
