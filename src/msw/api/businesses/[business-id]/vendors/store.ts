import { createMockStore } from '@msw/utils/createMockStore'
import { vendors } from '@fixtures/generated/vendors.gen'

export const vendorStore = createMockStore(() => vendors)
