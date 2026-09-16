import { BaseComboBoxOption } from '@internal-types/utility/comboBoxOption'
import type { ReportConfig } from '@schemas/features/unifiedReports/reportConfig'

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
