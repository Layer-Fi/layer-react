import type { DateGroupBy } from '@schemas/reports/unifiedReport'

export type GroupByOption = {
  label: string
  value: DateGroupBy
}

export type OptionOrNull = null | GroupByOption

export function createDateGroupByOnChange(onValueChange: (value: DateGroupBy | null) => void) {
  return (selected: OptionOrNull) => {
    onValueChange(selected?.value ?? null)
  }
}
