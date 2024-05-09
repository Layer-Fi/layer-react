import React, { useContext, useEffect, useState } from 'react'
import { LinkedAccountsContext } from '../../contexts/LinkedAccountsContext'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import CreditCardIcon from '../../icons/CreditCard'
import FolderIcon from '../../icons/Folder'
import LinkIcon from '../../icons/Link'
import PlaidIcon from '../../icons/PlaidIcon'
import SunriseIcon from '../../icons/Sunrise'
import { OnboardingStep } from '../../types/layer_context'
import { ActionableRow } from '../ActionableRow'
import { Badge, BadgeVariant } from '../Badge'
import { BadgeSize } from '../Badge/Badge'
import { Button } from '../Button'
import { DataState, DataStateStatus } from '../DataState'
import { Text } from '../Typography'

export interface ConnectAccountProps {
  onboardingStep: OnboardingStep
  onTransactionsToReviewClick?: () => void
}

export const ConnectAccount = ({
  onboardingStep,
  onTransactionsToReviewClick,
}: ConnectAccountProps) => {
  const { addConnection } = useContext(LinkedAccountsContext)
  const { data, isLoading } = useBankTransactions()

  const [transactionsToReview, setTransactionsToReview] = useState(0)

  useEffect(() => {
    if (data && data.length > 0 && !isLoading) {
      // @TODO - count only current / last month?
      setTransactionsToReview(data.length)
    }
  }, [data, isLoading])

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
          button={
            <Button
              onClick={() => addConnection('PLAID')}
              rightIcon={<LinkIcon size={12} />}
            >
              Connect
            </Button>
          }
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
        description='Your transactions are now available on the platform, to see all data on the charts, categorise transactions.'
      />
      {onTransactionsToReviewClick && transactionsToReview > 0 ? (
        <ActionableRow
          icon={<FolderIcon size={12} />}
          title={
            <Text>
              Categorise transactions{' '}
              <Badge variant={BadgeVariant.WARNING} size={BadgeSize.SMALL}>
                {transactionsToReview} pending
              </Badge>
            </Text>
          }
          description='Once your data is on the platform categorize them in Bank Transactions tab'
          onClick={() => onTransactionsToReviewClick()}
        />
      ) : null}
    </>
  )
}
