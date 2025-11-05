import { useContext, useMemo } from 'react'
import { LinkedAccountsContext } from '../../contexts/LinkedAccountsContext/LinkedAccountsContext'
import { useBankTransactionsFilters } from '../../contexts/BankTransactionsFiltersContext/useBankTransactionsFilters'
import { useAugmentedBankTransactions } from '../../hooks/useBankTransactions/useAugmentedBankTransactions'
import BellIcon from '../../icons/Bell'
import CreditCardIcon from '../../icons/CreditCard'
import FolderIcon from '../../icons/Folder'
import LinkIcon from '../../icons/Link'
import PlaidIcon from '../../icons/PlaidIcon'
import SunriseIcon from '../../icons/Sunrise'
import { DisplayState } from '../../types/bank_transactions'
import { OnboardingStep } from '../../types/layer_context'
import { countTransactionsToReview } from '../../utils/bankTransactions'
import { ActionableRow } from '../ActionableRow/ActionableRow'
import { Badge, BadgeVariant } from '../Badge/Badge'
import { BadgeSize } from '../Badge/Badge'
import { Button } from '../Button'
import { DataState, DataStateStatus } from '../DataState/DataState'
import { Text } from '../Typography'

export interface ConnectAccountProps {
  onboardingStep: OnboardingStep
  onTransactionsToReviewClick?: () => void
  currentMonthOnly?: boolean
}

export const ConnectAccount = ({
  onboardingStep,
  onTransactionsToReviewClick,
}: ConnectAccountProps) => {
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
          title='No accounts connected'
          description='Populate your accounting dashboard in 3 steps'
        />
        <ActionableRow
          iconBox={<PlaidIcon />}
          title='Connect accounts'
          description='Import data with one simple integration.'
          button={(
            <Button
              onClick={() => { void addConnection('PLAID') }}
              rightIcon={<LinkIcon size={12} />}
            >
              Connect
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
        title='Account linked successfully'
        description='Your transactions are now available on the platform, to see all data on the charts, categorize transactions.'
      />
      {onTransactionsToReviewClick && transactionsToReview > 0
        ? (
          <ActionableRow
            icon={<FolderIcon size={12} />}
            title={(
              <Text>
                Categorize transactions
                {' '}
                <Badge
                  variant={BadgeVariant.WARNING}
                  size={BadgeSize.SMALL}
                  icon={<BellIcon size={12} />}
                >
                  {transactionsToReview}
                  {' '}
                  pending
                </Badge>
              </Text>
            )}
            description='Once your data is on the platform categorize them in Bank Transactions tab'
            onClick={() => onTransactionsToReviewClick()}
          />
        )
        : null}
    </>
  )
}
