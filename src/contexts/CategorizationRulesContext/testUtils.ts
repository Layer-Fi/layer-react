import { UpdateCategorizationRulesSuggestion } from '../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { BankTransactionDirection } from '../../schemas/bankTransactions/base'

/**
 * Toggle this to enable/disable the test helper in development
 * When true, window.testRuleSuggestionModal() will be available in the browser console
 */
export const ENABLE_TEST_HELPER = true

/**
 * Creates a mock rule suggestion for testing the SuggestedCategorizationRuleUpdates modal
 * @returns A complete mock UpdateCategorizationRulesSuggestion object
 */
export const createMockRuleSuggestion = (): UpdateCategorizationRulesSuggestion => ({
  type: 'Create_Categorization_Rule_For_Counterparty',
  newRule: {
    name: 'Test Counterparty Rule',
    category: { type: 'AccountId', id: '123e4567-e89b-12d3-a456-426614174000' },
    counterpartyFilter: '456e4567-e89b-12d3-a456-426614174111',
    createdBySuggestionId: 'test-suggestion-123',
    applyRetroactively: true,
    externalId: null,
    suggestion1: null,
    suggestion2: null,
    suggestion3: null,
    businessNameFilter: null,
    clientNameFilter: null,
    merchantTypeFilter: null,
    transactionDescriptionFilter: null,
    transactionTypeFilter: null,
    bankDirectionFilter: null,
    amountMinFilter: null,
    amountMaxFilter: null,
    bankTransactionTypeFilter: null,
    mccFilter: null,
  },
  counterparty: {
    id: '456e4567-e89b-12d3-a456-426614174111',
    name: 'Test Vendor Inc',
    logo: null,
    website: null,
    externalId: 'test-vendor-external-id',
    mccs: [],
  },
  suggestionPrompt: 'You have categorized 3 transactions from Test Vendor Inc as Office Expenses. Would you like to always use this category for this merchant?',
  transactionsThatWillBeAffected: [
    {
      id: 'txn-001',
      amount: -125.50,
      date: new Date('2024-10-15'),
      direction: BankTransactionDirection.Debit,
      description: 'Test Vendor Inc - Office Supplies',
      counterpartyName: 'Test Vendor Inc',
    },
    {
      id: 'txn-002',
      amount: -89.99,
      date: new Date('2024-10-10'),
      direction: BankTransactionDirection.Debit,
      description: 'Test Vendor Inc - Subscription',
      counterpartyName: 'Test Vendor Inc',
    },
    {
      id: 'txn-003',
      amount: -89.99,
      date: new Date('2024-10-10'),
      direction: BankTransactionDirection.Debit,
      description: 'Test Vendor Inc - Subscription',
      counterpartyName: 'Test Vendor Inc',
    },
    {
      id: 'txn-004',
      amount: -89.99,
      date: new Date('2024-10-10'),
      direction: BankTransactionDirection.Debit,
      description: 'Test Vendor Inc - Subscription',
      counterpartyName: 'Test Vendor Inc',
    },
    {
      id: 'txn-005',
      amount: -89.99,
      date: new Date('2024-10-10'),
      direction: BankTransactionDirection.Debit,
      description: 'Test Vendor Inc - Subscription',
      counterpartyName: 'Test Vendor Inc',
    },
    {
      id: 'txn-006',
      amount: -89.99,
      date: new Date('2024-10-10'),
      direction: BankTransactionDirection.Debit,
      description: 'Test Vendor Inc - Subscription',
      counterpartyName: 'Test Vendor Inc',
    },
    {
      id: 'txn-007',
      amount: -89.99,
      date: new Date('2024-10-10'),
      direction: BankTransactionDirection.Debit,
      description: 'Test Vendor Inc - Subscription',
      counterpartyName: 'Test Vendor Inc',
    },
    {
      id: 'txn-008',
      amount: -89.99,
      date: new Date('2024-10-10'),
      direction: BankTransactionDirection.Debit,
      description: 'Test Vendor Inc - Subscription',
      counterpartyName: 'Test Vendor Inc',
    },
    {
      id: 'txn-009',
      amount: -89.99,
      date: new Date('2024-10-10'),
      direction: BankTransactionDirection.Debit,
      description: 'Test Vendor Inc - Subscription',
      counterpartyName: 'Test Vendor Inc',
    },
    {
      id: 'txn-010',
      amount: -89.99,
      date: new Date('2024-10-10'),
      direction: BankTransactionDirection.Debit,
      description: 'Test Vendor Inc - Subscription',
      counterpartyName: 'Test Vendor Inc',
    },
    {
      id: 'txn-011',
      amount: -89.99,
      date: new Date('2024-10-10'),
      direction: BankTransactionDirection.Debit,
      description: 'Test Vendor Inc - Subscription',
      counterpartyName: 'Test Vendor Inc',
    },
  ],
})

/**
 * Sets up development helper that exposes window.testRuleSuggestionModal()
 * Call this in a useEffect to enable testing the rule suggestion modal
 *
 * @param setRuleSuggestion - The setter function from CategorizationRulesContext
 * @returns Cleanup function to remove the helper from window
 */
export const setupRuleSuggestionDevHelper = (
  setRuleSuggestion: (suggestion: UpdateCategorizationRulesSuggestion | null) => void,
): (() => void) => {
  if (!ENABLE_TEST_HELPER || typeof window === 'undefined') return () => {}

  const win = window as Window & { testRuleSuggestionModal?: () => void }
  win.testRuleSuggestionModal = () => {
    setRuleSuggestion(createMockRuleSuggestion())
  }
  console.debug('💡 Development helper available: window.testRuleSuggestionModal()')

  return () => {
    if (win.testRuleSuggestionModal) {
      delete win.testRuleSuggestionModal
    }
  }
}
