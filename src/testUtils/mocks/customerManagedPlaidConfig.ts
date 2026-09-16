import { vi } from 'vitest'

import { type CustomerManagedPlaidConfig } from '@schemas/features/linkedAccounts/customerManagedPlaidConfig'

export const makeCustomerManagedPlaidConfig = (
  overrides?: Partial<CustomerManagedPlaidConfig>,
): CustomerManagedPlaidConfig => ({
  createLinkToken: vi.fn(() => Promise.resolve({ linkToken: 'customer-link-token' })),
  createUpdateModeLinkToken: vi.fn(() => Promise.resolve({ linkToken: 'customer-update-token' })),
  onPublicTokenReceived: vi.fn(() => Promise.resolve()),
  ...overrides,
})
