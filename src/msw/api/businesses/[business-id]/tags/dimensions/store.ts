import { type TagDimension } from '@schemas/tag'

import { createMockStore } from '@msw/utils/createMockStore'
import { tagDimensions } from '@fixtures/tagDimensions/mocks'

export const tagDimensionStore = createMockStore<TagDimension>(() => tagDimensions)
