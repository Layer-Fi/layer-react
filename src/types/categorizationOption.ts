import { Schema } from 'effect'
import type { SuggestedMatch, Split } from './bank_transactions'
import {
  ClassificationSchema,
  makeExclusion,
  type CategorizationEncoded,
  type Classification,
  type ClassificationEncoded,
  type NestedCategorization,
} from '../schemas/categorization'
import { makeAccountId, makeStableName } from '../schemas/accountIdentifier'
import { unsafeAssertUnreachable } from '../utils/switch/assertUnreachable'

export enum CategorizationOption {
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
  abstract get type(): CategorizationOption
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
    return CategorizationOption.SuggestedMatch
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
    return CategorizationOption.Category
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
      default:
        return unsafeAssertUnreachable({
          value: this.internalValue,
          message: 'Unexpected category type in CategoryAsOption.value',
        })
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
      default:
        return unsafeAssertUnreachable({
          value: this.internalValue,
          message: 'Unexpected category type in CategoryAsOption.classification',
        })
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
    return CategorizationOption.Placeholder
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
    return CategorizationOption.Split
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
    return CategorizationOption.ApiCategorization
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
      default:
        return unsafeAssertUnreachable({
          value: this.internalValue,
          message: 'Unexpected categorization type in ApiCategorizationAsOption.classification',
        })
    }
  }

  get classificationEncoded(): ClassificationEncoded | null {
    return this.classification ? Schema.encodeSync(ClassificationSchema)(this.classification) : null
  }
}
