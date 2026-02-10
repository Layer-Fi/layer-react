import { Schema } from 'effect'

import type { Split, SuggestedMatch } from '@internal-types/bank_transactions'
import { makeAccountId, makeStableName } from '@schemas/accountIdentifier'
import {
  type CategorizationEncoded,
  type Classification,
  type ClassificationEncoded,
  ClassificationSchema,
  makeExclusion,
  type NestedCategorization,
} from '@schemas/categorization'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { BaseComboBoxOption } from '@ui/ComboBox/baseComboBoxOption'

export enum CategorizationOption {
  Category = 'Category',
  SuggestedMatch = 'SuggestedMatch',
  Split = 'Split',
  Placeholder = 'Placeholder',
  ApiCategorization = 'ApiCategorization',
}

export abstract class BaseCategorizationOption<T> extends BaseComboBoxOption<T> {
  /** Returns the option type discriminator */
  abstract get type(): CategorizationOption

  /** Returns the Classification for this option, or null if not applicable */
  abstract get classification(): Classification | null

  /** Returns the encoded Classification for this option, or null if not applicable */
  abstract get classificationEncoded(): ClassificationEncoded | null
}

export class SuggestedMatchAsOption extends BaseCategorizationOption<SuggestedMatch> {
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

export class CategoryAsOption extends BaseCategorizationOption<NestedCategorization> {
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

export class PlaceholderAsOption extends BaseCategorizationOption<PlaceholderOption> {
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

export class SplitAsOption extends BaseCategorizationOption<Split[]> {
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

  get value(): string {
    const firstSplit = this.internalValue[0]
    if (this.internalValue.length == 1 && firstSplit) {
      return firstSplit.category?.value ?? ''
    }
    return 'split'
  }

  get classification() {
    return null
  }

  get classificationEncoded() {
    return null
  }
}

export class ApiCategorizationAsOption extends BaseCategorizationOption<CategorizationEncoded> {
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
