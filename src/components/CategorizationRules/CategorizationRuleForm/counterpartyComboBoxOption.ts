import type { BankTransactionCounterparty } from '@schemas/bankTransactions/base'
import { BaseComboBoxOption } from '@ui/ComboBox/baseComboBoxOption'

export class CounterpartyComboBoxOption extends BaseComboBoxOption<BankTransactionCounterparty> {
  constructor(counterparty: BankTransactionCounterparty) {
    super(counterparty)
  }

  get original() {
    return this.internalValue
  }

  get label() {
    return this.internalValue.name ?? this.internalValue.id
  }

  get value() {
    return this.internalValue.id
  }
}

/* Legacy rules filter on a transaction description rather than a counterparty. They stay
 * viewable, but the description can never be picked as a value for a new or updated rule. */
export class TransactionDescriptionComboBoxOption extends BaseComboBoxOption<string> {
  get original() {
    return this.internalValue
  }

  get label() {
    return this.internalValue
  }

  get value() {
    return `transaction-description:${this.internalValue}`
  }

  get isDisabled() {
    return true
  }

  get isHidden() {
    return true
  }
}

export type CounterpartyOption = CounterpartyComboBoxOption | TransactionDescriptionComboBoxOption
