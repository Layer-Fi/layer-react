import { setCheckable } from '@test-utils/forms/checkable'
import { type CheckboxFillArgs, type FormFillerContext } from '@test-utils/forms/types'

export function createCheckboxFiller(context: FormFillerContext) {
  return (args: CheckboxFillArgs) => {
    return setCheckable(context, 'checkbox', args)
  }
}
