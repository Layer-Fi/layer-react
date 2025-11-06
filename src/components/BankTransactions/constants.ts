import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'

export type MobileComponentType = 'regularList' | 'mobileList'

export const CategorizedCategories = [
  CategorizationStatus.CATEGORIZED,
  CategorizationStatus.SPLIT,
  CategorizationStatus.MATCHED,
]

export const ReviewCategories = [
  CategorizationStatus.READY_FOR_INPUT,
  CategorizationStatus.LAYER_REVIEW,
  CategorizationStatus.PENDING,
]
