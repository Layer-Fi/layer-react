import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

// Rule-update suggestions live on bank transactions, not in a store of their
// own; rejecting one only needs to succeed.
export const del = createMockEndpoint<undefined, Record<string, never>>({
  method: 'delete',
  path: '*/v1/businesses/:businessId/categorization-rules/suggestions/:suggestionId',
  resolve: () => ({}),
})
