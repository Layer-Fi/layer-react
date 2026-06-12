import { useContext, useMemo } from 'react'
import { Bell, CreditCard, Folder, Link, Sunrise } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { DisplayState } from '@internal-types/bankTransactions'
import { type OnboardingStep } from '@internal-types/layerContext'
import { countTransactionsToReview } from '@utils/bankTransactions/shared'
import { useAugmentedBankTransactions } from '@hooks/features/bankTransactions/useAugmentedBankTransactions'
import { useBankTransactionsFilters } from '@contexts/BankTransactionsFiltersContext/useBankTransactionsFilters'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import PlaidIcon from '@icons/PlaidIcon'
import { Button } from '@ui/Button/Button'
import { Span } from '@ui/Typography/Text'
import { ActionableRow } from '@components/ActionableRow/ActionableRow'
import { Badge, BadgeVariant } from '@components/Badge/Badge'
import { BadgeSize } from '@components/Badge/Badge'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { LinkAccountDemoTooltip } from '@components/LinkedAccounts/LinkAccountDemoTooltip'

export interface ConnectAccountProps {
  onboardingStep: OnboardingStep
  onTransactionsToReviewClick?: () => void
  currentMonthOnly?: boolean
}

export const ConnectAccount = ({
  onboardingStep,
  onTransactionsToReviewClick,
}: ConnectAccountProps) => {
  const { t } = useTranslation()
  const { addConnection } = useContext(LinkedAccountsContext)
  const { business } = useLayerContext()
  const isDemoBusiness = business?.isDemo ?? false
  const { filters } = useBankTransactionsFilters({
    scope: DisplayState.review,
  })
  const { data } = useAugmentedBankTransactions({
    filters,
  })

  const transactionsToReview = useMemo(
    () => countTransactionsToReview({ transactions: data }),
    [data],
  )

  if (onboardingStep === 'connectAccount') {
    return (
      <>
        <DataState
          status={DataStateStatus.info}
          icon={<CreditCard size={12} />}
          title={t('linkedAccounts:empty.no_accounts_connected', 'No accounts connected')}
          description={t('linkedAccounts:label.populate_accounting_dashboard_three_steps', 'Populate your accounting dashboard in 3 steps')}
        />
        <ActionableRow
          iconBox={<PlaidIcon />}
          title={t('linkedAccounts:label.connect_accounts', 'Connect accounts')}
          description={t('linkedAccounts:label.import_data_simple_integration', 'Import data with one simple integration.')}
          button={(
            <LinkAccountDemoTooltip active={isDemoBusiness}>
              <Button
                onPress={() => { void addConnection('PLAID') }}
                isDisabled={isDemoBusiness}
              >
                {t('common:action.connect_label', 'Connect')}
                <Link size={12} />
              </Button>
            </LinkAccountDemoTooltip>
          )}
        />
      </>
    )
  }

  return (
    <>
      <DataState
        status={DataStateStatus.success}
        icon={<Sunrise size={12} />}
        title={t('linkedAccounts:label.account_linked_successfully', 'Account linked successfully')}
        description={t('bankTransactions:label.transactions_available_platform', 'Your transactions are now available on the platform, to see all data on the charts, categorize transactions.')}
      />
      {onTransactionsToReviewClick && transactionsToReview > 0
        ? (
          <ActionableRow
            icon={<Folder size={12} />}
            title={(
              <Span>
                {t('bankTransactions:action.categorize_transactions', 'Categorize transactions')}
                {' '}
                <Badge
                  variant={BadgeVariant.WARNING}
                  size={BadgeSize.SMALL}
                  icon={<Bell size={12} />}
                >
                  {transactionsToReview}
                  {' '}
                  {t('ui:state.pending', 'pending')}
                </Badge>
              </Span>
            )}
            description={t('bankTransactions:label.data_on_platform_categorize', 'Once your data is on the platform categorize them in Bank Transactions tab')}
            onClick={() => onTransactionsToReviewClick()}
          />
        )
        : null}
    </>
  )
}
