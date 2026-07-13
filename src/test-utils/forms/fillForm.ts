import { screen, within } from '@testing-library/react'
import { type UserEvent } from '@testing-library/user-event'

import { createCheckboxFiller } from '@test-utils/forms/checkbox'
import { createComboBoxFiller } from '@test-utils/forms/comboBox'
import { createNumberFiller } from '@test-utils/forms/number'
import { createRadioFiller } from '@test-utils/forms/radio'
import { createTextFiller } from '@test-utils/forms/text'
import { createToggleFiller } from '@test-utils/forms/toggle'
import { type FillFormSpec, type FormFillerContext } from '@test-utils/forms/types'

export type { FillFormSpec } from '@test-utils/forms/types'

export function createFormFiller(user: UserEvent, scope?: HTMLElement) {
  const context: FormFillerContext = {
    ui: scope ? within(scope) : screen,
    user,
  }

  const text = createTextFiller(context)
  const number = createNumberFiller(context)
  const checkbox = createCheckboxFiller(context)
  const toggle = createToggleFiller(context)
  const radio = createRadioFiller(context)
  const comboBox = createComboBoxFiller(context)

  const fill = async (specs: readonly FillFormSpec[]) => {
    for (const spec of specs) {
      switch (spec.kind) {
        case 'text':
          await text(spec)
          break
        case 'number':
          await number(spec)
          break
        case 'checkbox':
          await checkbox(spec)
          break
        case 'toggle':
          await toggle(spec)
          break
        case 'radio':
          await radio(spec)
          break
        case 'comboBox':
          await comboBox(spec)
          break
      }
    }
  }

  return { text, number, checkbox, toggle, radio, comboBox, fill }
}

export type FormFiller = ReturnType<typeof createFormFiller>
