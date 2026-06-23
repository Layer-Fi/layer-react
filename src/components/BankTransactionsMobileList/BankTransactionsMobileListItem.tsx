import { type ReactNode, useCallback, useEffect, useMemo } from 'react'
import classNames from 'classnames'
import { File } from 'lucide-react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { convertMatchDetailsToLinkingMetadata } from '@schemas/bankTransactions/match'
import { hasReceipts, isCategorized, isCredit } from '@utils/bankTransactions/shared'
import { useDelayedRemoveBankTransaction } from '@hooks/features/bankTransactions/useDelayedRemoveBankTransaction'
import { useDelayedVisibility } from '@hooks/utils/visibility/useDelayedVisibility'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { type LinkingMetadata, useInAppLinkContext } from '@contexts/InAppLinkContext'
import { AnimatedPresenceElement } from '@ui/AnimatedPresenceElement/AnimatedPresenceElement'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { BankTransactionsAmountDate } from '@components/BankTransactions/BankTransactionsAmountDate'

import './bankTransactionsMobileListItem.scss'

export interface BankTransactionsMobileListItemProps {
  index: number
  bankTransaction: BankTransaction
  initialLoad?: boolean
  onClose: (id: string) => void
  onRemove: (id: string) => void
}

const getInAppLink = (
  bankTransaction: BankTransaction,
  renderInAppLink?: (details: LinkingMetadata) => ReactNode,
) => {
  if (
    bankTransaction.categorizationStatus === CategorizationStatus.MATCHED
    && renderInAppLink
    && bankTransaction.match?.details
  ) {
    return renderInAppLink(convertMatchDetailsToLinkingMetadata(bankTransaction.match.details))
  }
  return null
}

export const BankTransactionsMobileListItem = ({
  index,
  bankTransaction,
  initialLoad,
  onClose,
  onRemove,
}: BankTransactionsMobileListItemProps) => {
  const { shouldHideAfterCategorize } = useBankTransactionsContext()

  const categorized = isCategorized(bankTransaction)

  const { renderInAppLink } = useInAppLinkContext()

  const handleRemove = useCallback(
    () => onRemove(bankTransaction.id),
    [onRemove, bankTransaction.id],
  )

  const { isBeingRemoved } = useDelayedRemoveBankTransaction({ bankTransaction, onRemove: handleRemove })

  const displayAsCategorized = isBeingRemoved ? false : categorized

  useEffect(() => {
    if (bankTransaction.recentlyCategorized && !shouldHideAfterCategorize) {
      onClose(bankTransaction.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bankTransaction.recentlyCategorized,
    bankTransaction.match,
    bankTransaction.category,
  ])

  const inAppLink = useMemo(() => {
    if (!displayAsCategorized) {
      return null
    }
    return getInAppLink(bankTransaction, renderInAppLink)
  }, [displayAsCategorized, bankTransaction, renderInAppLink])

  const { isVisible } = useDelayedVisibility({ delay: index * 20, initialVisibility: Boolean(initialLoad) })

  return (
    <AnimatedPresenceElement
      variant='fade'
      isOpen={!isBeingRemoved}
      motionKey={bankTransaction.id}
    >
      <VStack
        className={classNames('Layer__BankTransactionsMobileListItem', isVisible && 'show')}
      >
        <HStack gap='sm' justify='space-between'>
          <HStack align='center' overflow='hidden'>
            <VStack align='start' gap='3xs' overflow='hidden'>
              <Span ellipsis>
                {bankTransaction.counterpartyName ?? bankTransaction.description}
              </Span>
              {inAppLink}
              <HStack gap='2xs' align='center' overflow='hidden'>
                <Span ellipsis size='sm'>
                  {bankTransaction.accountInstitution?.name && `${bankTransaction.accountInstitution.name} — `}
                  {bankTransaction.accountName}
                  {bankTransaction.accountMask && ` ${bankTransaction.accountMask}`}
                </Span>
                {hasReceipts(bankTransaction) ? <File size={12} /> : null}
              </HStack>
            </VStack>
          </HStack>
          <BankTransactionsAmountDate
            amount={bankTransaction.amount}
            date={bankTransaction.date}
            slotProps={{
              MoneySpan: {
                size: 'md',
                displayPlusSign: isCredit(bankTransaction),
              },
            }}
          />
        </HStack>
      </VStack>
    </AnimatedPresenceElement>
  )
}
