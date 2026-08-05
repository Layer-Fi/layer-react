import { vendors } from '@fixtures/generated/vendors.gen'
import { createMockStore } from '@msw/utils/createMockStore'

export const vendorStore = createMockStore(() => vendors)
