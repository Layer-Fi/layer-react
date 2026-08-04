import type { ReportConfig } from '@schemas/unifiedReports/reportConfig'
import { BaseComboBoxOption } from '@ui/ComboBox/baseComboBoxOption'

export class UnifiedReportComboBoxOption extends BaseComboBoxOption<ReportConfig> {
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
