import { within } from '@testing-library/react'

import { type ComboBoxFillArgs, type FormFillerContext } from '@test-utils/forms/types'

export function createComboBoxFiller({ ui, user }: FormFillerContext) {
  return async ({ field, option }: ComboBoxFillArgs) => {
    const input = ui.getByLabelText(field)

    await user.click(input)

    const optionEl = await within(document.body).findByRole('option', { name: option })

    await user.click(optionEl)

    return optionEl
  }
}
