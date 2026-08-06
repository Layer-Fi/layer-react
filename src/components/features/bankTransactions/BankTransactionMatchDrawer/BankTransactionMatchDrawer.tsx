import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import type { Row, RowSelectionState } from '@tanstack/react-table'

import { Button } from '@ui/Button/Button'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { SearchField } from '@ui/SearchField/SearchField'
import { HStack, VStack } from '@ui/Stack/Stack'

import './bankTransactionMatchDrawer.scss'
import { BankTransactionMatchTable } from '../BankTransactionMatchTable/BankTransactionMatchTable'
import { BankTransactionsList } from '../BankTransactionsList/BankTransactionsList'
import { BankTransactionsTable } from '../BankTransactionsTable/BankTransactionsTable'
import { SimpleDataTable } from '@blocks/Table/SimpleDataTable/SimpleDataTable'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Span } from '@ui/Typography/Text'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { isMoneyIn } from '@utils/features/bankTransactions/shared'

interface BankTransactionMatchDrawerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  bankTransaction: BankTransaction
}

export const BankTransactionMatchDrawer = ({
  isOpen,
  onOpenChange,
  bankTransaction,
}: BankTransactionMatchDrawerProps) => {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [selectedMatches, setSelectedMatches] = useState<BankTransaction[]>([])
  const [selectedTransactions, setSelectedTransactions] = useState<RowSelectionState>({})
  const handleOpenChange = useCallback((nextIsOpen: boolean) => {
    if (!nextIsOpen) {
      setQuery('')
    }
    onOpenChange(nextIsOpen)
  }, [onOpenChange])

  const Header = useCallback(({ close }: { close: () => void }) => (
    <ModalTitleWithClose
      heading={<ModalHeading size='sm' weight='bold'>{t('bankTransactions:action.select_invoice_payments_to_match', 'Select invoice payments to match')}</ModalHeading>}
      onClose={close}
      hideBottomPadding
    />
  ), [t])

  const mockTransactions = [
    {
      "id": "0c738d23-e0d2-45e5-ac32-00fc61356103",
      "matchType": "INVOICE_PAYMENT",
      "target_is_matched": false,
      "details": {
          "type": "Invoice_Match",
          "id": "2626adf0-3c54-4952-a23e-6284d0ab014a",
          "amount": 5580,
          "date": "2026-07-24T19:00:00Z",
          "description": "Invoice payment via ACH for 1 invoice with the following reference numbers: INV-QL552",
          "adjustment": null,
          "external_id": "payment-TestingPartyDan-invoice-0",
          "reference_number": null,
          "invoice_identifiers": [
              {
                  "id": "ede879c0-d41f-4bc4-857c-0a1e44978fc1",
                  "external_id": "TestingPartyDan-invoice-0",
                  "reference_number": "INV-QL552",
                  "metadata": null
              }
          ],
          "metadata": null
      }
  },
  {
    "id": "0c738d23-e0d2-45e5-ac32-00fc61356104",
    "matchType": "INVOICE_PAYMENT",
    "target_is_matched": false,
    "details": {
        "type": "Invoice_Match",
        "id": "2626adf0-3c54-4952-a23e-6284d0ab014a",
        "amount": 2640,
        "date": "2026-07-24T19:00:00Z",
        "description": "Invoice payment via ACH for 1 invoice with the following reference numbers: INV-QL552",
        "adjustment": null,
        "external_id": "payment-TestingPartyDan-invoice-0",
        "reference_number": null,
        "invoice_identifiers": [
            {
                "id": "ede879c0-d41f-4bc4-857c-0a1e44978fc1",
                "external_id": "TestingPartyDan-invoice-0",
                "reference_number": "INV-QL553",
                "metadata": null
            }
        ],
        "metadata": null
    }
},
{
  "id": "0c738d23-e0d2-45e5-ac32-00fc61356105",
  "matchType": "INVOICE_PAYMENT",
  "target_is_matched": false,
  "details": {
      "type": "Invoice_Match",
      "id": "2626adf0-3c54-4952-a23e-6284d0ab014a",
      "amount": 1680,
      "date": "2026-07-24T19:00:00Z",
      "description": "Invoice payment via ACH for 1 invoice with the following reference numbers: INV-QL552",
      "adjustment": null,
      "external_id": "payment-TestingPartyDan-invoice-0",
      "reference_number": null,
      "invoice_identifiers": [
          {
              "id": "ede879c0-d41f-4bc4-857c-0a1e44978fc1",
              "external_id": "TestingPartyDan-invoice-0",
              "reference_number": "INV-QL556",
              "metadata": null
          }
      ],
      "metadata": null
  }
},
]

  const bankTransactionRows = useMemo(() => {
    return mockTransactions.map(transaction => ({
      id: transaction.id,
      date: transaction.details.date,
      amount: transaction.details.amount,
      description: transaction.details.description,
    }))
  }, [mockTransactions])
  enum BankTransactionColumns {
    Date = 'Date',
    Amount = 'Amount',
    Description = 'Description',
  }
  type BankTransactionRowType = Row<BankTransaction>

  
const BankTransactionDateCell = ({ bankTransaction }: { bankTransaction: BankTransaction }) => {
  const { formatDate } = useIntlFormatter()

  return <Span>{formatDate(bankTransaction.date)}</Span>
}

const BankTransactionAmountCell = ({ bankTransaction }: { bankTransaction: BankTransaction }) => (
  <MoneySpan amount={bankTransaction.amount} displayPlusSign={isMoneyIn(bankTransaction)} />
)

  const columnConfig = useMemo(() => {
    return [
      
      {
        id: BankTransactionColumns.Description,
        header: t('bankTransactions:label.description', 'Description'),
        cell: (row: BankTransactionRowType) => <BankTransactionDateCell bankTransaction={row.original} />,
        isRowHeader: true,
      },
      {
        id: BankTransactionColumns.Amount,
        header: t('common:label.amount', 'Amount'),
        cell: (row: BankTransactionRowType) => <BankTransactionAmountCell bankTransaction={row.original} />,
      },
    ]
  }, [t])


  const selectionProps = useMemo(() => ({
    rowSelection: selectedTransactions,
    onRowSelectionChange: setSelectedTransactions,
    selectAllAriaLabel: 'Select all transactions',
    getRowSelectionAriaLabel: (row: BankTransactionRowType) => `Select Rows`,
    enableRowSelection: true
  }), [selectedTransactions])


  const totalAmountFromMatches = useMemo(() => {
    return bankTransactionRows.filter(transaction => selectedTransactions[transaction.id]).reduce((acc, transaction) => acc + transaction.amount, 0)
  }, [selectedTransactions])

  return (
    <Drawer
      slots={{ Header }}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      fixedHeight
      isDismissable
    >
      {({ close }) => (
        <VStack className='Layer__CategorySelectDrawer__ListContainer' pb='md' gap='md'>
          <SearchField value={query} onChange={setQuery} label={t('bankTransactions:action.search_invoice_payments', 'Search invoice payments...')} />
          <div className='Layer__bank-transactions__table-wrapper Layer__BankTransactions__TableWrapper'>
            <SimpleDataTable
              data={bankTransactionRows as unknown as BankTransaction[]}
              columnConfig={columnConfig}
              ariaLabel='Selectable bank transactions'
              componentName='BankTransactionMatchTable'
              slots={{
                EmptyState: () => <div>No bank transactions found</div>,
                ErrorState: () => <div>Error loading bank transactions</div>,
              }}
              isLoading={false}
              isError={false}
              selectionProps={selectionProps}
              isRowSelected={row => row.getIsSelected()}
            />
            </div>
              {/* derived from bank transaction and selected matches */}
              <VStack gap='xs' align='end'>
                <p className='Layer__P'>Bank transaction amount: <MoneySpan amount={bankTransaction.amount} displayPlusSign={isMoneyIn(bankTransaction)} /></p>
                <p className='Layer__P'>Total: <MoneySpan amount={totalAmountFromMatches} displayPlusSign={isMoneyIn(bankTransaction)} /> </p>
                <p className='Layer__P'>Difference: <MoneySpan amount={bankTransaction.amount - totalAmountFromMatches} displayPlusSign={isMoneyIn(bankTransaction)} /></p>
              </VStack>
            <HStack justify='space-between'>
              <Button variant='solid' onClick={() => {
                setSelectedMatches([])
              }}>
                {t('bankTransactions:action.add_matches', 'Add matches')}
              </Button>
            </HStack>
        </VStack>
      )}
    </Drawer>
  )
}
