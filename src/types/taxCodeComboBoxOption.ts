import type { BankTransactionTaxOption } from '@schemas/bankTransactions/bankTransaction'
import { BaseComboBoxOption } from '@ui/ComboBox/baseComboBoxOption'

export const NO_TAX_CODE = '__no_tax_code__'

export class TaxCodeComboBoxOption extends BaseComboBoxOption<BankTransactionTaxOption> {
  constructor(taxOption: BankTransactionTaxOption) {
    super(taxOption)
  }

  static noTaxCode(label: string): TaxCodeComboBoxOption {
    return new TaxCodeComboBoxOption({
      code: NO_TAX_CODE,
      displayName: label,
    })
  }

  get original() {
    return this.internalValue
  }

  get label() {
    return this.internalValue.displayName
  }

  get value() {
    return this.internalValue.code
  }
}
