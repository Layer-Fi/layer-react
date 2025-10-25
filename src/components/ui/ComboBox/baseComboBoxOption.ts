/**
 * Base abstract class for all ComboBox options.
 * Provides the minimal interface needed for display in a ComboBox component.
 *
 * @template T - The type of the original value being wrapped
 */
export abstract class BaseComboBoxOption<T> {
  protected internalValue: T

  constructor(value: T) {
    this.internalValue = value
  }

  /** Returns the original wrapped value */
  abstract get original(): T

  /** Returns the option type discriminator */
  abstract get type(): string

  /** Returns the display label for the option */
  abstract get label(): string

  /** Returns the unique value identifier for the option */
  abstract get value(): string
}
