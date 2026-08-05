import { screen, within } from '@testing-library/react'
import { type UserEvent } from '@testing-library/user-event'

import { createCheckboxFiller } from '@testUtils/forms/checkbox'
import { createComboBoxFiller } from '@testUtils/forms/comboBox'
import { createNumberFiller } from '@testUtils/forms/number'
import { createRadioFiller } from '@testUtils/forms/radio'
import { createTextFiller } from '@testUtils/forms/text'
import { createToggleFiller } from '@testUtils/forms/toggle'
import { type FillFormSpec, type FormFillerContext } from '@testUtils/forms/types'

export type { FillFormSpec } from '@testUtils/forms/types'

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
