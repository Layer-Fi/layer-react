import { CategorizationStatus } from '../../types'

export type MobileVariant = 'regular' | 'native-1'

export enum DisplayState {
  review = 'review',
  categorized = 'categorized',
}

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
