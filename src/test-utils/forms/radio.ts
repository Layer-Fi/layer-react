import { within } from '@testing-library/react'

import { type FormFillerContext, type RadioFillArgs } from '@test-utils/forms/types'

export function createRadioFiller({ ui, user }: FormFillerContext) {
  return async ({ field, option }: RadioFillArgs) => {
    const scopeQueries = field
      ? within(ui.getByRole('radiogroup', { name: field }))
      : ui

    const radioInput = scopeQueries.getByRole('radio', { name: option })

    await user.click(radioInput)

    return radioInput
  }
}
