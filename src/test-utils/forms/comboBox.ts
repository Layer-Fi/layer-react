import { within } from '@testing-library/react'

import { type ComboBoxFillArgs, type FormFillerContext } from '@test-utils/forms/types'

const getOptionQueries = (input: HTMLElement) => {
  const listBoxId = input.getAttribute('aria-controls')
  const listBox = listBoxId ? document.getElementById(listBoxId) : null

  return within(listBox ?? document.body)
}

export function createComboBoxFiller({ ui, user }: FormFillerContext) {
  return async ({ field, option }: ComboBoxFillArgs) => {
    const input = ui.getByLabelText(field)

    await user.click(input)

    const optionEl = await getOptionQueries(input).findByRole('option', { name: option })

    await user.click(optionEl)

    return optionEl
  }
}
