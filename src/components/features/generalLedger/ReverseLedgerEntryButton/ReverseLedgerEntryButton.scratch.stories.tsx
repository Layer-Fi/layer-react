import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

import { ReverseLedgerEntryButton } from '@features/generalLedger/ReverseLedgerEntryButton/ReverseLedgerEntryButton'

import { Gallery } from '@testUtils/storybook/layout/Gallery'
import { Section } from '@testUtils/storybook/layout/Section'

const meta: Meta<typeof ReverseLedgerEntryButton> = {
  title: 'Scratch/ReverseLedgerEntryButtonIconColor',
  component: ReverseLedgerEntryButton,
  parameters: { chromatic: { viewports: [1280] } },
  // The button renders bare here, so it needs the design-system root class for CSS variables.
  decorators: [Story => <div className='Layer__component'><Story /></div>],
}

export default meta

type Story = StoryObj<typeof ReverseLedgerEntryButton>

const noop = () => Promise.resolve()

const readColors = (canvasElement: HTMLElement, index: number) => {
  const button = canvasElement.querySelectorAll('.Layer__UI__Button')[index]
  const icon = button?.querySelector('svg')

  if (!button || !icon) {
    throw new Error(`Expected a button with an icon at index ${index}`)
  }

  return {
    text: getComputedStyle(button).color,
    icon: getComputedStyle(icon).color,
  }
}

export const ScratchIconColorFollowsText: Story = {
  render: () => (
    <Gallery direction='row'>
      <Section title='Enabled'>
        <ReverseLedgerEntryButton onReverse={noop} />
      </Section>
      <Section title='Disabled (already reversed)'>
        <ReverseLedgerEntryButton onReverse={noop} alreadyReversed />
      </Section>
    </Gallery>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findAllByRole('button', { name: /Reverse entry/ })

    const enabled = readColors(canvasElement, 0)
    const disabled = readColors(canvasElement, 1)

    await expect(enabled.icon).toBe(enabled.text)
    await expect(disabled.icon).toBe(disabled.text)
    await expect(disabled.text).not.toBe(enabled.text)
  },
}
