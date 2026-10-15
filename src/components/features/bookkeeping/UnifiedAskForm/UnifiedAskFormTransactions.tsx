import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type AskFormTransaction } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, VStack } from '@ui/Stack/Stack'
import { UnifiedAskFormTransactionCells } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormTransactionCells'

const COLLAPSED_ROW_COUNT = 3

type UnifiedAskFormTransactionRowsProps = {
  transactions: ReadonlyArray<AskFormTransaction>
  expanded?: boolean
}

const UnifiedAskFormTransactionRows = ({ transactions, expanded }: UnifiedAskFormTransactionRowsProps) => (
  <VStack className='Layer__UnifiedAskForm__Rows' {...toDataProperties({ expanded })}>
    {transactions.map(transaction => (
      <VStack key={transaction.id} className='Layer__UnifiedAskForm__Row' pi='md'>
        <HStack className='Layer__UnifiedAskForm__RowSummary' align='center' gap='xs' overflow='hidden' fluid>
          <UnifiedAskFormTransactionCells transaction={transaction} />
        </HStack>
      </VStack>
    ))}
  </VStack>
)

type UnifiedAskFormTransactionsProps = {
  transactions: ReadonlyArray<AskFormTransaction>
  title: string
  /** Shows the first rows with the rest behind a drawer, for the takeover where the list would push the form down. */
  collapsible?: boolean
}

export const UnifiedAskFormTransactions = ({ transactions, title, collapsible = false }: UnifiedAskFormTransactionsProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const [isOpen, setIsOpen] = useState(false)

  const Header = useCallback(() => (
    <ModalTitleWithClose heading={<ModalHeading size='md' weight='bold'>{title}</ModalHeading>} hideBottomPadding />
  ), [title])
  const slots = useMemo(() => ({ Header }), [Header])

  if (!collapsible || transactions.length <= COLLAPSED_ROW_COUNT) {
    return <UnifiedAskFormTransactionRows transactions={transactions} />
  }

  const showAllLabel = t('bookkeeping:UnifiedAskForm.UnifiedAskFormTransactions.action.show_all_transactions', 'Show all {{displayCount}} transactions', {
    displayCount: formatNumber(transactions.length),
  })

  return (
    <VStack gap='xs'>
      <UnifiedAskFormTransactionRows transactions={transactions.slice(0, COLLAPSED_ROW_COUNT)} />
      <HStack pi='md' pbe='sm'>
        <Button variant='text' onPress={() => setIsOpen(true)}>{showAllLabel}</Button>
      </HStack>
      <Drawer isOpen={isOpen} onOpenChange={setIsOpen} variant='mobile-drawer' isDismissable aria-label={showAllLabel} slots={slots}>
        <VStack pbs='sm' pbe='md'>
          <UnifiedAskFormTransactionRows transactions={transactions} expanded />
        </VStack>
      </Drawer>
    </VStack>
  )
}
