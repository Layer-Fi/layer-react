import { type FieldName, type FormFillerContext } from '@test-utils/forms/types'

type CheckableRole = 'checkbox' | 'switch'
type CheckableFillArgs = {
  field: FieldName
  checked: boolean
}

const isChecked = (element: HTMLElement) => (
  element instanceof HTMLInputElement
    ? element.checked
    : element.getAttribute('aria-checked') === 'true'
)

export const setCheckable = async (
  { ui, user }: FormFillerContext,
  role: CheckableRole,
  { field, checked }: CheckableFillArgs,
) => {
  const control = ui.getByRole(role, { name: field })

  if (isChecked(control) !== checked) {
    await user.click(control)
  }

  return control
}
