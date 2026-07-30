import { type Meta, type StoryObj } from '@storybook/react-vite'
import { CreditCard } from 'lucide-react'

import { Button } from '@ui/Button/Button'
import { ActionableRow } from '@blocks/ActionableRow/ActionableRow'

import { Col, Gallery } from '@test-utils/storybook/gallery'

const noop = () => {}

const TITLE = 'Connect a bank account'
const DESCRIPTION = 'Link your account to import transactions.'

type Cell = {
  label: string
  props: React.ComponentProps<typeof ActionableRow>
}

const CELLS: Cell[] = [
  { label: 'title only', props: { title: TITLE } },
  { label: 'title and description', props: { title: TITLE, description: DESCRIPTION } },
  {
    label: 'icon and chevron action',
    props: {
      icon: <CreditCard size={16} />,
      title: TITLE,
      description: DESCRIPTION,
      onClick: noop,
    },
  },
  {
    label: 'custom button',
    props: {
      icon: <CreditCard size={16} />,
      title: TITLE,
      description: DESCRIPTION,
      button: <Button variant='outlined'>Connect</Button>,
    },
  },
]

const meta: Meta<typeof ActionableRow> = {
  title: 'Blocks/ActionableRow',
  component: ActionableRow,
  args: {
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default meta

type Story = StoryObj<typeof ActionableRow>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery inlineSize={480}>
      {CELLS.map(({ label, props }) => (
        <Col key={label} label={label}>
          <ActionableRow {...props} />
        </Col>
      ))}
    </Gallery>
  ),
}
