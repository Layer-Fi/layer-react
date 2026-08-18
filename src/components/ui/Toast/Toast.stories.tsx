import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Toast } from '@ui/Toast/Toast'

const TYPES = ['default', 'success', 'error'] as const

const meta: Meta<typeof Toast> = {
  title: 'UI/Toast',
  component: Toast,
  args: {
    content: 'Your changes have been saved.',
    type: 'default',
    isExiting: false,
  },
  argTypes: {
    type: { control: 'select', options: TYPES },
  },
}

export default meta

type Story = StoryObj<typeof Toast>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div
      className='Layer__ToastsContainer'
      style={{ position: 'static', padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      {TYPES.map(type => (
        <Toast key={type} content={`This is a ${type} toast`} type={type} isExiting={false} />
      ))}
      <Toast
        content='Your changes have been saved, but two of the linked accounts could not be refreshed and will retry automatically.'
        type='default'
        isExiting={false}
      />
    </div>
  ),
}
