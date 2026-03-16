import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { DisplayState } from '@internal-types/bankTransactions'
import { type OnboardingStep } from '@internal-types/layerContext'
import { countTransactionsToReview } from '@utils/bankTransactions'
import { useAugmentedBankTransactions } from '@hooks/features/bankTransactions/useAugmentedBankTransactions'
import { useBankTransactionsFilters } from '@contexts/BankTransactionsFiltersContext/useBankTransactionsFilters'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import BellIcon from '@icons/Bell'
import CreditCardIcon from '@icons/CreditCard'
import FolderIcon from '@icons/Folder'
import LinkIcon from '@icons/Link'
import PlaidIcon from '@icons/PlaidIcon'
import SunriseIcon from '@icons/Sunrise'
import { ActionableRow } from '@components/ActionableRow/ActionableRow'
import { Badge, BadgeVariant } from '@components/Badge/Badge'
import { BadgeSize } from '@components/Badge/Badge'
import { Button } from '@components/Button/Button'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Text } from '@components/Typography/Text'

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
          icon={<CreditCardIcon size={12} />}
          title={t('linkedAccounts:noAccountsConnected', 'No accounts connected')}
          description={t('linkedAccounts:populateYourAccountingDashboardIn3Steps', 'Populate your accounting dashboard in 3 steps')}
        />
        <ActionableRow
          iconBox={<PlaidIcon />}
          title={t('linkedAccounts:connectAccounts', 'Connect accounts')}
          description={t('linkedAccounts:importDataWithOneSimpleIntegration', 'Import data with one simple integration.')}
          button={(
            <Button
              onClick={() => { void addConnection('PLAID') }}
              rightIcon={<LinkIcon size={12} />}
            >
              {t('common:connect', 'Connect')}
            </Button>
          )}
        />
      </>
    )
  }

  return (
    <>
      <DataState
        status={DataStateStatus.success}
        icon={<SunriseIcon size={12} />}
        title={t('linkedAccounts:accountLinkedSuccessfully', 'Account linked successfully')}
        description={t('bankTransactions:yourTransactionsAreNowAvailableOnThePlatformToSeeAllDataOnTheChartsCategorizeTransactions', 'Your transactions are now available on the platform, to see all data on the charts, categorize transactions.')}
      />
      {onTransactionsToReviewClick && transactionsToReview > 0
        ? (
          <ActionableRow
            icon={<FolderIcon size={12} />}
            title={(
              <Text>
                {t('bankTransactions:categorizeTransactions', 'Categorize transactions')}
                {' '}
                <Badge
                  variant={BadgeVariant.WARNING}
                  size={BadgeSize.SMALL}
                  icon={<BellIcon size={12} />}
                >
                  {transactionsToReview}
                  {' '}
                  {t('ui:pending', 'pending')}
                </Badge>
              </Text>
            )}
            description={t('bankTransactions:onceYourDataIsOnThePlatformCategorizeThemInBankTransactionsTab', 'Once your data is on the platform categorize them in Bank Transactions tab')}
            onClick={() => onTransactionsToReviewClick()}
          />
        )
        : null}
    </>
  )
}
