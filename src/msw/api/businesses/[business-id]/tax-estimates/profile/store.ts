import { type TaxProfile } from '@schemas/features/taxEstimates/profile'

import { makeTaxProfile } from '@fixtures/taxEstimates/mocks'
import { createMockStore } from '@msw/utils/createMockStore'

const TAX_PROFILE_ID = 'tax-profile'

// TaxProfile has no id; keep a singleton row so writes persist into GET.
const taxProfileStore = createMockStore<TaxProfile>(
  () => [makeTaxProfile()],
  { getId: () => TAX_PROFILE_ID },
)

export const getTaxProfile = () => taxProfileStore.findById(TAX_PROFILE_ID) ?? makeTaxProfile()

export const saveTaxProfile = (profile: TaxProfile) => taxProfileStore.save(profile)
