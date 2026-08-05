import { type Meta, type StoryObj } from '@storybook/react-vite'

import { SearchField } from '@ui/SearchField/SearchField'

import { Gallery, Row } from '@testUtils/storybook/layout/gallery'

const noop = () => {}

const meta: Meta<typeof SearchField> = {
  title: 'UI/SearchField',
  component: SearchField,
  args: {
    label: 'Search',
    value: '',
    onChange: noop,
  },
  argTypes: {
    isDisabled: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof SearchField>

const Field = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <Row label={label}>
    <div style={{ inlineSize: 240 }}>{children}</div>
  </Row>
)

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery gap={16}>
      <Field label='empty'>
        <SearchField label='Search' value='' onChange={noop} />
      </Field>
      <Field label='value'>
        <SearchField label='Search' value='Office supplies' onChange={noop} />
      </Field>
      <Field label='disabled'>
        <SearchField label='Search' value='Office supplies' onChange={noop} isDisabled />
      </Field>
    </Gallery>
  ),
}
