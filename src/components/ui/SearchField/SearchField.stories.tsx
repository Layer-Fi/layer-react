import { type Meta, type StoryObj } from '@storybook/react-vite'

import { SearchField } from '@ui/SearchField/SearchField'

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

const Row = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ width: 96, fontSize: 12, opacity: 0.6 }}>{label}</span>
    <div style={{ width: 240 }}>{children}</div>
  </div>
)

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      <Row label='empty'>
        <SearchField label='Search' value='' onChange={noop} />
      </Row>
      <Row label='value'>
        <SearchField label='Search' value='Office supplies' onChange={noop} />
      </Row>
      <Row label='disabled'>
        <SearchField label='Search' value='Office supplies' onChange={noop} isDisabled />
      </Row>
    </div>
  ),
}
