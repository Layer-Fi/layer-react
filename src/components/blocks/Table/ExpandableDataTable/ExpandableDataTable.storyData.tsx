import { Alignment } from '@internal-types/utility/table'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import type { ColumnConfig } from '@blocks/Table/DataTable/utils/column'

export type AccountNode = {
  accountId: string
  name: string
  accountType: string
  currentBalance: number
  priorBalance: number
  subAccounts?: AccountNode[]
}

export const ACCOUNT_TREE: AccountNode[] = [
  {
    accountId: 'assets',
    name: 'Assets',
    accountType: 'Asset',
    currentBalance: 412_800_00,
    priorBalance: 388_140_00,
    subAccounts: [
      {
        accountId: 'assets.current',
        name: 'Current Assets',
        accountType: 'Asset',
        currentBalance: 214_300_00,
        priorBalance: 201_050_00,
        subAccounts: [
          { accountId: 'assets.current.checking', name: 'Business Checking', accountType: 'Bank', currentBalance: 88_420_00, priorBalance: 79_310_00 },
          { accountId: 'assets.current.savings', name: 'Business Savings', accountType: 'Bank', currentBalance: 95_000_00, priorBalance: 95_000_00 },
          { accountId: 'assets.current.ar', name: 'Accounts Receivable', accountType: 'Receivable', currentBalance: 30_880_00, priorBalance: 26_740_00 },
        ],
      },
      {
        accountId: 'assets.fixed',
        name: 'Fixed Assets',
        accountType: 'Asset',
        currentBalance: 198_500_00,
        priorBalance: 187_090_00,
        subAccounts: [
          { accountId: 'assets.fixed.equipment', name: 'Equipment', accountType: 'Asset', currentBalance: 142_500_00, priorBalance: 138_200_00 },
          { accountId: 'assets.fixed.vehicles', name: 'Vehicles', accountType: 'Asset', currentBalance: 56_000_00, priorBalance: 48_890_00 },
        ],
      },
    ],
  },
  {
    accountId: 'liabilities',
    name: 'Liabilities',
    accountType: 'Liability',
    currentBalance: 96_240_00,
    priorBalance: 104_610_00,
    subAccounts: [
      { accountId: 'liabilities.ap', name: 'Accounts Payable', accountType: 'Payable', currentBalance: 41_240_00, priorBalance: 52_610_00 },
      { accountId: 'liabilities.card', name: 'Corporate Card', accountType: 'Credit Card', currentBalance: 15_000_00, priorBalance: 12_000_00 },
      { accountId: 'liabilities.loan', name: 'Equipment Loan', accountType: 'Loan', currentBalance: 40_000_00, priorBalance: 40_000_00 },
    ],
  },
  {
    accountId: 'equity',
    name: 'Equity',
    accountType: 'Equity',
    currentBalance: 316_560_00,
    priorBalance: 283_530_00,
    subAccounts: [
      { accountId: 'equity.retained', name: 'Retained Earnings', accountType: 'Equity', currentBalance: 268_560_00, priorBalance: 243_530_00 },
      { accountId: 'equity.contributions', name: 'Owner Contributions', accountType: 'Equity', currentBalance: 48_000_00, priorBalance: 40_000_00 },
    ],
  },
]

export const getAccountSubRows = (node: AccountNode) => node.subAccounts
export const getAccountRowId = (node: AccountNode) => node.accountId

const DeltaCell = ({ node }: { node: AccountNode }) => {
  const delta = node.currentBalance - node.priorBalance

  if (delta === 0) return <Span variant='subtle'>—</Span>

  return <MoneySpan variant={delta > 0 ? 'inherit' : 'subtle'} amount={delta} displayPlusSign />
}

export const getAccountColumnConfig = (): ColumnConfig<AccountNode> => [
  {
    id: 'Account',
    header: 'Account',
    cell: row => <Span>{row.original.name}</Span>,
    isRowHeader: true,
  },
  {
    id: 'AccountType',
    header: 'Type',
    cell: row => <Span variant='subtle'>{row.original.accountType}</Span>,
  },
  {
    id: 'PriorBalance',
    header: 'Prior period',
    cell: row => <MoneySpan variant='subtle' amount={row.original.priorBalance} />,
    alignment: Alignment.Right,
  },
  {
    id: 'CurrentBalance',
    header: 'Current',
    cell: row => <MoneySpan weight='bold' amount={row.original.currentBalance} />,
    alignment: Alignment.Right,
  },
  {
    id: 'Delta',
    header: 'Change',
    cell: row => <DeltaCell node={row.original} />,
    alignment: Alignment.Right,
  },
]

export const ACCOUNTS_STORY_COMPONENT_NAME = 'TableStoryAccounts'
export const ACCOUNTS_STORY_COLUMNS = 'minmax(12rem, 1fr) 9rem 9rem 9rem 9rem'
