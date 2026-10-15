import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Checkbox, type CheckboxLayout } from '@ui/Checkbox/Checkbox'
import { CheckboxGroup } from '@ui/CheckboxGroup/CheckboxGroup'

import { Gallery } from '@testUtils/storybook/layout/Gallery'
import { Row } from '@testUtils/storybook/layout/Row'
import { Section } from '@testUtils/storybook/layout/Section'

const ITEMS = [
  { value: 'figures', label: 'I confirm the figures are correct' },
  { value: 'copy', label: 'Email me a copy' },
] as const

const STATES = [
  { label: 'none checked', value: [] },
  { label: 'some checked', value: ['figures'] },
  { label: 'all checked', value: ['figures', 'copy'] },
  { label: 'disabled', value: ['figures'], isDisabled: true },
] as const

const LAYOUTS: CheckboxLayout[] = ['inline', 'row']

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
      {LAYOUTS.map(layout => (
        <Section key={layout} title={`layout: ${layout}`}>
          {STATES.map(state => (
            <Row key={state.label} label={state.label}>
              <CheckboxGroup aria-label={state.label} value={[...state.value]} isDisabled={'isDisabled' in state ? state.isDisabled : undefined}>
                {ITEMS.map(item => <Checkbox key={item.value} value={item.value} size='lg' layout={layout}>{item.label}</Checkbox>)}
              </CheckboxGroup>
            </Row>
          ))}
        </Section>
      ))}
    </Gallery>
  ),
}
