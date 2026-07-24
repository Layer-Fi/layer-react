import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Radio, RadioGroup } from '@ui/RadioGroup/RadioGroup'

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  args: {
    'aria-label': 'Options',
    'orientation': 'vertical',
  },
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
    isDisabled: { control: 'boolean' },
  },
  render: props => (
    <RadioGroup {...props}>
      <Radio value='one'>Option one</Radio>
      <Radio value='two'>Option two</Radio>
      <Radio value='three'>Option three</Radio>
    </RadioGroup>
  ),
}

export default meta

type Story = StoryObj<typeof RadioGroup>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
}

const Col = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
    {children}
  </div>
)

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}>
      <Col label='vertical'>
        <RadioGroup aria-label='Vertical' defaultValue='one'>
          <Radio value='one'>Option one</Radio>
          <Radio value='two'>Option two</Radio>
          <Radio value='three'>Option three</Radio>
        </RadioGroup>
      </Col>
      <Col label='horizontal'>
        <RadioGroup aria-label='Horizontal' orientation='horizontal' defaultValue='one'>
          <Radio value='one'>Option one</Radio>
          <Radio value='two'>Option two</Radio>
        </RadioGroup>
      </Col>
      <Col label='disabled'>
        <RadioGroup aria-label='Disabled' defaultValue='one' isDisabled>
          <Radio value='one'>Option one</Radio>
          <Radio value='two'>Option two</Radio>
        </RadioGroup>
      </Col>
    </div>
  ),
}
