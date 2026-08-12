import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { FormSwitchField } from '@blocks/Form/FormSwitchField'

import { FormFieldVariantGallery } from '@testUtils/storybook/layout/formField'

const LABEL = 'Credit Card'

const meta: Meta<typeof FormSwitchField> = {
  title: 'Blocks/Form/FormSwitchField (scratch)',
  component: FormSwitchField,
}

export default meta

type Story = StoryObj<typeof FormSwitchField>

/**
 * The unchanged state: a stacked switch emits `Layer__FormSwitchField` but not the `--inline`
 * modifier, which is a `data-inline` attribute on the shared field today.
 */
export const StackedSwitch: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.Layer__FormSwitchField')).not.toBeNull()
    await expect(canvasElement.querySelector('.Layer__FormSwitchField--inline')).toBeNull()
  },
  render: () => (
    <FormFieldVariantGallery
      defaultValue
      variants={[{ label: 'stacked' }]}
      renderField={props => <FormSwitchField label={LABEL} {...props} />}
    />
  ),
}

/**
 * The changed state: the inline switch that the invoice finalize form renders emits the `--inline`
 * modifier alongside its base name.
 */
export const InlineSwitch: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('.Layer__FormSwitchField.Layer__FormSwitchField--inline'),
    ).not.toBeNull()
  },
  render: () => (
    <FormFieldVariantGallery
      defaultValue
      variants={[{ label: 'inline', props: { inline: true } }]}
      renderField={props => <FormSwitchField label={LABEL} {...props} />}
    />
  ),
}
