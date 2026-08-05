import { type ReactNode, useEffect, useMemo } from 'react'
import { File } from 'lucide-react'

import { type BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { convertMatchDetailsToLinkingMetadata } from '@utils/features/bankTransactions/matchLinkingMetadata'
import { hasReceipts, isCategorized, isMoneyIn } from '@utils/features/bankTransactions/shared'
import { useBankTransactionsContext } from '@providers/bankTransactions/BankTransactions/BankTransactionsContext'
import { type LinkingMetadata, useInAppLinkContext } from '@providers/common/InAppLink/InAppLinkContext'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { BankTransactionsAmountDate } from '@features/bankTransactions/BankTransactionsAmountDate/BankTransactionsAmountDate'

import './bankTransactionsMobileListItem.scss'

export interface BankTransactionsMobileListItemProps {
  bankTransaction: BankTransaction
  onClose: (id: string) => void
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
  bankTransaction,
  onClose,
}: BankTransactionsMobileListItemProps) => {
  const { shouldHideAfterCategorize } = useBankTransactionsContext()

  const categorized = isCategorized(bankTransaction)

  const { renderInAppLink } = useInAppLinkContext()

  const isBeingRemoved = bankTransaction.recentlyCategorized && shouldHideAfterCategorize

  const displayAsCategorized = isBeingRemoved ? false : categorized

  useEffect(() => {
    if (bankTransaction.recentlyCategorized && !shouldHideAfterCategorize) {
      onClose(bankTransaction.id)
    }
  }, [
    bankTransaction.id,
    bankTransaction.recentlyCategorized,
    bankTransaction.match,
    bankTransaction.category,
    shouldHideAfterCategorize,
    onClose,
  ])

  const inAppLink = useMemo(() => {
    if (!displayAsCategorized) {
      return null
    }
    return getInAppLink(bankTransaction, renderInAppLink)
  }, [displayAsCategorized, bankTransaction, renderInAppLink])

  return (
    <HStack gap='sm' justify='space-between'>
      <VStack align='start' gap='3xs' overflow='hidden'>
        <Span ellipsis>{bankTransaction.description}</Span>
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
      <BankTransactionsAmountDate
        amount={bankTransaction.amount}
        date={bankTransaction.date}
        slotProps={{
          MoneySpan: {
            size: 'md',
            displayPlusSign: isMoneyIn(bankTransaction),
          },
          Stack: { gap: '3xs' },
        }}
      />
    </HStack>
  )
}
