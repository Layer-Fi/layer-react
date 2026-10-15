import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Checkbox, type CheckboxVariant } from '@ui/Checkbox/Checkbox'
import { CheckboxGroup } from '@ui/CheckboxGroup/CheckboxGroup'

import { Gallery } from '@testUtils/storybook/layout/Gallery'
import { Row } from '@testUtils/storybook/layout/Row'
import { Section } from '@testUtils/storybook/layout/Section'

const ITEMS = [
  { value: 'figures', label: 'I confirm the figures are correct' },
  { value: 'copy', label: 'Email me a copy' },
] as const

const STATES = [
  { label: 'none checked', value: [], isDisabled: false },
  { label: 'some checked', value: ['figures'], isDisabled: false },
  { label: 'all checked', value: ['figures', 'copy'], isDisabled: false },
  { label: 'disabled', value: ['figures'], isDisabled: true },
] as const

const VARIANTS: CheckboxVariant[] = ['default', 'row']

const meta: Meta<typeof CheckboxGroup> = {
  title: 'UI/CheckboxGroup',
  component: CheckboxGroup,
}

export default meta

type Story = StoryObj<typeof CheckboxGroup>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery>
      {VARIANTS.map(variant => (
        <Section key={variant} title={`variant: ${variant}`}>
          {STATES.map(state => (
            <Row key={state.label} label={state.label}>
              <CheckboxGroup aria-label={state.label} value={[...state.value]} isDisabled={state.isDisabled}>
                {ITEMS.map(item => <Checkbox key={item.value} value={item.value} size='lg' variant={variant}>{item.label}</Checkbox>)}
              </CheckboxGroup>
            </Row>
          ))}
        </Section>
      ))}
    </Gallery>
  ),
}
