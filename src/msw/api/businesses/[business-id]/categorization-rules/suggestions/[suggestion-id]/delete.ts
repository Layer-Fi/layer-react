import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

// Suggestions live on bank transactions; rejecting one only needs to succeed.
export const del = createMockEndpoint<undefined, Record<string, never>>({
  method: 'delete',
  path: '*/v1/businesses/:businessId/categorization-rules/suggestions/:suggestionId',
  resolve: () => ({}),
})
