import type { BankTransactionTaxOption } from '@internal-types/bankTransactions'
import { BaseComboBoxOption } from '@ui/ComboBox/baseComboBoxOption'

export class TaxCodeComboBoxOption extends BaseComboBoxOption<BankTransactionTaxOption> {
  constructor(taxOption: BankTransactionTaxOption) {
    super(taxOption)
  }

  get original() {
    return this.internalValue
  }

  get label() {
    return this.internalValue.display_name
  }

  get value() {
    return this.internalValue.code
  }
}
