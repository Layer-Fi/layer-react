import { setCheckable } from '@testUtils/forms/checkable'
import { type FormFillerContext, type ToggleFillArgs } from '@testUtils/forms/types'

export function createToggleFiller(context: FormFillerContext) {
  return ({ field, on }: ToggleFillArgs) => {
    return setCheckable(context, 'switch', { field, checked: on })
  }
}
