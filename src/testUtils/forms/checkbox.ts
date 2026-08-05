import { setCheckable } from '@testUtils/forms/checkable'
import { type CheckboxFillArgs, type FormFillerContext } from '@testUtils/forms/types'

export function createCheckboxFiller(context: FormFillerContext) {
  return (args: CheckboxFillArgs) => {
    return setCheckable(context, 'checkbox', args)
  }
}
