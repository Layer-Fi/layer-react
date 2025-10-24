import { Schema } from 'effect'
import type { SuggestedMatch } from '../../types/bank_transactions'
import {
  ClassificationSchema,
  makeExclusion,
  type CategorizationEncoded,
  type Classification,
  type ClassificationEncoded,
  type NestedCategorization,
} from '../../schemas/categorization'
import type { Tag } from '../../features/tags/tagSchemas'
import type { CustomerVendorSchema } from '../../features/customerVendor/customerVendorSchemas'
import { makeAccountId, makeStableName } from '../../schemas/accountIdentifier'

export enum BankTransactionCategorizationOption {
  Category = 'Category',
  SuggestedMatch = 'SuggestedMatch',
  Split = 'Split',
  Placeholder = 'Placeholder',
  ApiCategorization = 'ApiCategorization',
}

export abstract class BaseOption<T> {
  protected internalValue: T

  constructor(value: T) {
    this.internalValue = value
  }

  abstract get original(): T
  abstract get type(): BankTransactionCategorizationOption
  abstract get label(): string
  abstract get value(): string
  abstract get classification(): Classification | null
  abstract get classificationEncoded(): ClassificationEncoded | null
}

export class SuggestedMatchAsOption extends BaseOption<SuggestedMatch> {
  constructor(suggestedMatch: SuggestedMatch) {
    super(suggestedMatch)
  }

  get original() {
    return this.internalValue
  }

  get type() {
    return BankTransactionCategorizationOption.SuggestedMatch
  }

  get label() {
    return this.internalValue.details.description
  }

  get value() {
    return this.internalValue.id
  }

  get classification() {
    return null
  }

  get classificationEncoded() {
    return null
  }
}

export class CategoryAsOption extends BaseOption<NestedCategorization> {
  constructor(category: NestedCategorization) {
    super(category)
  }

  get original() {
    return this.internalValue
  }

  get type() {
    return BankTransactionCategorizationOption.Category
  }

  get label() {
    return this.internalValue.displayName
  }

  get value(): string {
    switch (this.internalValue.type) {
      case 'AccountNested':
        return this.internalValue.id
      case 'OptionalAccountNested':
        return this.internalValue.stableName
      case 'ExclusionNested':
        return this.internalValue.id
      default: {
        const _exhaustive: never = this.internalValue
        throw new Error(`Unexpected category type: ${(_exhaustive as NestedCategorization).type}`)
      }
    }
  }

  get classification(): Classification {
    switch (this.internalValue.type) {
      case 'AccountNested':
        return makeAccountId(this.internalValue.id)
      case 'OptionalAccountNested':
        return makeStableName(this.internalValue.stableName)
      case 'ExclusionNested':
        return makeExclusion(this.internalValue.id)
      default: {
        const _exhaustive: never = this.internalValue
        throw new Error(`Unexpected category type: ${(_exhaustive as NestedCategorization).type}`)
      }
    }
  }

  get classificationEncoded(): ClassificationEncoded {
    return Schema.encodeSync(ClassificationSchema)(this.classification)
  }
}

export type PlaceholderOption = {
  label: string
  value: string
  isHidden?: boolean
}

export class PlaceholderAsOption extends BaseOption<PlaceholderOption> {
  constructor(placeholder: PlaceholderOption) {
    super(placeholder)
  }

  get original() {
    return this.internalValue
  }

  get type() {
    return BankTransactionCategorizationOption.Placeholder
  }

  get label() {
    return this.internalValue.label
  }

  get value() {
    return this.internalValue.value
  }

  get isDisabled() {
    return true
  }

  get isHidden() {
    return this.internalValue.isHidden
  }

  get classification() {
    return null
  }

  get classificationEncoded() {
    return null
  }
}

export class SplitAsOption extends BaseOption<Split[]> {
  constructor(splits: Split[]) {
    super(splits)
  }

  get original() {
    return this.internalValue
  }

  get type() {
    return BankTransactionCategorizationOption.Split
  }

  get label(): string {
    return this.internalValue
      .map(split => split.category?.label ?? 'Uncategorized')
      .join(', ')
  }

  get value() {
    return 'split'
  }

  get classification() {
    return null
  }

  get classificationEncoded() {
    return null
  }
}

export class ApiCategorizationAsOption extends BaseOption<CategorizationEncoded> {
  constructor(categorization: CategorizationEncoded) {
    super(categorization)
  }

  get original() {
    return this.internalValue
  }

  get type() {
    return BankTransactionCategorizationOption.ApiCategorization
  }

  get label() {
    return this.internalValue.display_name
  }

  get value() {
    return this.internalValue.id
  }

  get classification(): Classification | null {
    switch (this.internalValue.type) {
      case 'Account':
        return makeAccountId(this.internalValue.id)
      case 'Exclusion':
        return makeExclusion(this.internalValue.id)
      case 'Split_Categorization':
        return null
      default: {
        const _exhaustive: never = this.internalValue
        throw new Error(`Unexpected categorization type: ${(_exhaustive as CategorizationEncoded).type}`)
      }
    }
  }

  get classificationEncoded(): ClassificationEncoded | null {
    return this.classification ? Schema.encodeSync(ClassificationSchema)(this.classification) : null
  }
}

export type BankTransactionCategoryComboBoxOption =
  CategoryAsOption
  | SuggestedMatchAsOption
  | SplitAsOption
  | PlaceholderAsOption
  | ApiCategorizationAsOption

export type Split = {
  amount: number
  inputValue: string
  category: BankTransactionCategoryComboBoxOption | null
  tags: readonly Tag[]
  customerVendor: typeof CustomerVendorSchema.Type | null
}

export const isCategoryAsOption = (option: BankTransactionCategoryComboBoxOption): option is CategoryAsOption => {
  return option.type === BankTransactionCategorizationOption.Category
}

export const isSuggestedMatchAsOption = (option: BankTransactionCategoryComboBoxOption): option is SuggestedMatchAsOption => {
  return option.type === BankTransactionCategorizationOption.SuggestedMatch
}

export const isSplitAsOption = (option: BankTransactionCategoryComboBoxOption): option is SplitAsOption => {
  return option.type === BankTransactionCategorizationOption.Split
}

export const isApiCategorizationAsOption = (option: BankTransactionCategoryComboBoxOption): option is ApiCategorizationAsOption => {
  return option.type === BankTransactionCategorizationOption.ApiCategorization
}

export const isPlaceholderAsOption = (option: BankTransactionCategoryComboBoxOption): option is PlaceholderAsOption => {
  return option.type === BankTransactionCategorizationOption.Placeholder
}
