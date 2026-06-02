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
