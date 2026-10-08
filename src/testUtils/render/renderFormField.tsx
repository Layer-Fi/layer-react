import { type ReactElement } from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FormFieldHarness } from '@testUtils/forms/FormFieldHarness'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

type RenderFormFieldOptions = {
  defaultValue: unknown
  userOptions?: Parameters<typeof userEvent.setup>[0]
}

/** Renders one `Form*Field` in a one-field form inside `LayerTestProvider`, with `userEvent` set up first. */
export const renderFormField = (field: ReactElement, { defaultValue, userOptions }: RenderFormFieldOptions) => ({
  user: userEvent.setup(userOptions),
  ...render(<FormFieldHarness defaultValue={defaultValue}>{field}</FormFieldHarness>, { wrapper: LayerTestProvider }),
})
