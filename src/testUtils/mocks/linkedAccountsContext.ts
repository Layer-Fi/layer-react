import { vi } from 'vitest'

import { type LinkedAccountsContextType } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsContext'

export const makeLinkedAccountsContext = (
  overrides?: Partial<LinkedAccountsContextType>,
): LinkedAccountsContextType => ({
  isLinking: false,
  isHostedLinkError: false,
  addConnection: vi.fn(() => Promise.resolve(false)),
  removeConnection: vi.fn(() => Promise.resolve()),
  repairConnection: vi.fn(() => Promise.resolve()),
  refetchAccountsAndTransactions: vi.fn(() => Promise.resolve()),
  unlinkBankAccount: vi.fn(() => Promise.resolve()),
  confirmAccount: vi.fn(() => Promise.resolve()),
  excludeAccount: vi.fn(() => Promise.resolve()),
  breakConnection: vi.fn(() => Promise.resolve()),
  ...overrides,
})
