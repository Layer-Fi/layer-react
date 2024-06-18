import { CategorizationStatus } from '../../types'

export type MobileComponentType = 'regularList' | 'mobileList'

export const CategorizedCategories = [
  CategorizationStatus.CATEGORIZED,
  CategorizationStatus.JOURNALING,
  CategorizationStatus.SPLIT,
  CategorizationStatus.MATCHED,
]

export const ReviewCategories = [
  CategorizationStatus.READY_FOR_INPUT,
  CategorizationStatus.LAYER_REVIEW,
]
