import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Chip, ChipGroup } from '@ui/Chip/Chip'

import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'

const meta: Meta<typeof ChipGroup> = {
  title: 'UI/Chip',
  component: ChipGroup,
  args: {
    ariaLabel: 'Answer',
  },
}

export default meta

type Story = StoryObj<typeof ChipGroup>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery>
      <Col label='default'>
        <ChipGroup ariaLabel='default'>
          <Chip value='meals'>Business Meals</Chip>
          <Chip value='office'>Office Expenses</Chip>
          <Chip value='other'>Something else</Chip>
        </ChipGroup>
      </Col>
      <Col label='selected'>
        <ChipGroup ariaLabel='selected' value='office'>
          <Chip value='meals'>Business Meals</Chip>
          <Chip value='office'>Office Expenses</Chip>
          <Chip value='other'>Something else</Chip>
        </ChipGroup>
      </Col>
      <Col label='small'>
        <ChipGroup ariaLabel='small' value='meals'>
          <Chip size='sm' value='meals'>Business Meals</Chip>
          <Chip size='sm' value='office'>Office Expenses</Chip>
          <Chip size='sm' value='other'>Something else</Chip>
        </ChipGroup>
      </Col>
      <Col label='wrapping'>
        <ChipGroup ariaLabel='wrapping' wrap>
          <Chip value='meals'>Business Meals</Chip>
          <Chip value='office'>Office Expenses</Chip>
          <Chip value='other-business'>Other Business Expenses</Chip>
          <Chip value='other'>Something else</Chip>
          <Chip value='mix'>A mix of the above</Chip>
        </ChipGroup>
      </Col>
      <Col label='disabled'>
        <ChipGroup ariaLabel='disabled' isDisabled>
          <Chip value='meals'>Business Meals</Chip>
          <Chip value='other'>Something else</Chip>
        </ChipGroup>
      </Col>
    </Gallery>
  ),
}
