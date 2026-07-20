import type { Split, SuggestedMatch } from '@internal-types/bankTransactions'
import { makeAccountId, makeStableName } from '@schemas/accountIdentifier'
import {
  type Categorization,
  type Classification,
  getClassificationFromCategorization,
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
        return this.internalValue.stableName !== null
          ? makeStableName(this.internalValue.stableName)
          : makeAccountId(this.internalValue.id)
      case 'OptionalAccountNested':
        return makeStableName(this.internalValue.stableName)
      case 'ExclusionNested':
        return makeExclusion(this.internalValue.category)
      default:
        return unsafeAssertUnreachable({
          value: this.internalValue,
          message: 'Unexpected category type in CategoryAsOption.classification',
        })
    }
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

  get isSingleSplit(): boolean {
    return this.internalValue.length === 1
  }

  get label(): string {
    return this.internalValue
      .map(split => split.category?.label ?? 'Uncategorized')
      .join(', ')
  }

  get value(): string {
    if (this.isSingleSplit) {
      return this.internalValue[0].category?.value ?? ''
    }
    return 'split'
  }

  get classification() {
    return null
  }
}

export class ApiCategorizationAsOption extends BaseCategorizationOption<Categorization> {
  constructor(categorization: Categorization) {
    super(categorization)
  }

  get original() {
    return this.internalValue
  }

  get type() {
    return CategorizationOption.ApiCategorization
  }

  get label() {
    return this.internalValue.displayName
  }

  get value() {
    return this.internalValue.id
  }

  get classification(): Classification | null {
    return getClassificationFromCategorization(this.internalValue)
  }
}
