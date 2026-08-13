import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { UnifiedReports } from '@views/UnifiedReports/UnifiedReports'

const PROFIT_AND_LOSS_ONLY_CLASS_NAME = 'Layer__ProfitAndLossCompareOptions__Container'
const ADDITIONAL_CONTROLS_SELECTOR = '.Layer__UnifiedReports__AdditionalControls'

const switchReport = async (canvasElement: HTMLElement, name: string) => {
  const canvas = within(canvasElement)
  const overlay = within(canvasElement.ownerDocument.body)

  await userEvent.click(await canvas.findByRole('button', { name: /Switch report/ }))
  await userEvent.click(await overlay.findByText(name, undefined, { timeout: 10_000 }))
}

const findAdditionalControls = async (canvasElement: HTMLElement) => {
  await waitFor(
    () => expect(canvasElement.querySelector(ADDITIONAL_CONTROLS_SELECTOR)).not.toBeNull(),
    { timeout: 10_000 },
  )

  return canvasElement.querySelector(ADDITIONAL_CONTROLS_SELECTOR)
}

const meta: Meta<typeof UnifiedReports> = {
  title: 'Components/UnifiedReports (scratch)',
  component: UnifiedReports,
  args: { navigationVariant: 'menu' },
  parameters: { chromatic: { viewports: [1280] } },
}

export default meta

type Story = StoryObj<typeof UnifiedReports>

/**
 * The changed state: profit and loss is the only report that shipped
 * `Layer__ProfitAndLossCompareOptions__Container`, and the only one that now carries it.
 */
export const ProfitAndLossAdditionalControls: Story = {
  play: async ({ canvasElement }) => {
    const additionalControls = await findAdditionalControls(canvasElement)

    await expect(additionalControls?.getAttribute('class')).toContain(PROFIT_AND_LOSS_ONLY_CLASS_NAME)
  },
}

/**
 * The baseline: business expenses renders the same shared element (it has a group-by control), and
 * must not carry the profit and loss name — a consumer rule written for compare options would
 * otherwise match it. Balance sheet is not usable here: its reporting basis is unset in the
 * fixture, so it renders no additional-controls element at all and would assert nothing.
 */
export const BusinessExpensesAdditionalControls: Story = {
  play: async ({ canvasElement }) => {
    await switchReport(canvasElement, 'Business Expenses')

    const additionalControls = await findAdditionalControls(canvasElement)

    await expect(additionalControls?.getAttribute('class')).toContain('Layer__UnifiedReport__AdditionalControls')
    await expect(additionalControls?.getAttribute('class')).not.toContain(PROFIT_AND_LOSS_ONLY_CLASS_NAME)
  },
}
