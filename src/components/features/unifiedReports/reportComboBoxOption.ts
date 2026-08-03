import type { ReportConfig } from '@schemas/reports/reportConfig'
import { BaseComboBoxOption } from '@ui/ComboBox/baseComboBoxOption'

export class ReportComboBoxOption extends BaseComboBoxOption<ReportConfig> {
  constructor(report: ReportConfig) {
    super(report)
  }

  get original() {
    return this.internalValue
  }

  get label() {
    return this.internalValue.displayName
  }

  get value() {
    return this.internalValue.key
  }
}
