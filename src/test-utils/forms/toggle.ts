import { setCheckable } from '@test-utils/forms/checkable'
import { type FormFillerContext, type ToggleFillArgs } from '@test-utils/forms/types'

export function createToggleFiller(context: FormFillerContext) {
  return ({ field, on }: ToggleFillArgs) => {
    return setCheckable(context, 'switch', { field, checked: on })
  }
}
