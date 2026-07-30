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
}

export type CounterpartyOption = CounterpartyComboBoxOption | TransactionDescriptionComboBoxOption

export const toCounterpartyValue = (option: CounterpartyOption | null) =>
  option instanceof CounterpartyComboBoxOption ? option.original : null

export const isTransactionDescriptionOption = (option: CounterpartyOption | null) =>
  option instanceof TransactionDescriptionComboBoxOption
