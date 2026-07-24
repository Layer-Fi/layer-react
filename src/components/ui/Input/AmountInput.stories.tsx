import { Fragment } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'

import { AmountInput } from '@ui/Input/AmountInput'

const noop = () => {}

const label: React.CSSProperties = { fontSize: 12, opacity: 0.6 }

const meta: Meta<typeof AmountInput> = {
  title: 'UI/AmountInput',
  component: AmountInput,
}

export default meta

type Story = StoryObj<typeof AmountInput>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '72px max-content',
        gap: '16px 24px',
        alignItems: 'center',
        padding: 24,
      }}
    >
      <Fragment>
        <span style={label}>empty</span>
        <AmountInput value='' onChange={noop} />
      </Fragment>
      <Fragment>
        <span style={label}>value</span>
        <AmountInput value='1234.56' onChange={noop} />
      </Fragment>
      <Fragment>
        <span style={label}>disabled</span>
        <AmountInput value='1234.56' onChange={noop} disabled />
      </Fragment>
      <Fragment>
        <span style={label}>error</span>
        <AmountInput value='0.00' onChange={noop} isInvalid errorMessage='Amount is required' />
      </Fragment>
    </div>
  ),
}
