import { useState } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'
import { FilterToken, type FilterTokenProps } from './FilterToken'

const meta: Meta<typeof FilterToken> = {
  title: 'Blocks/TableControls/FilterToken',
  component: FilterToken,
  args: {
    onRemove: () => alert('removed!')
  },
  decorators: [
    Story => (
      <>
        <Story />
      </>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof FilterToken>

const AMOUNT_OPERATOR_OPTIONS = [
  { value: 'lt', label: 'is less than' },
  { value: 'gt', label: 'is greater than' },
  { value: 'eq', label: 'is equal to' },
]

const AmountFilterTokenExample = (args: Pick<FilterTokenProps, 'onRemove'>) => {
  const [operator, setOperator] = useState('lt')
  const [value, setValue] = useState('$100')

  return (
    <FilterToken
      {...args}
      field='Amount'
      operator={operator}
      operatorOptions={AMOUNT_OPERATOR_OPTIONS}
      onOperatorChange={setOperator}
      valueType='string'
      value={value}
      onValueChange={setValue}
    />
  )
}

const CATEGORY_OPERATOR_OPTIONS = [
  { value: 'is', label: 'is' },
  { value: 'isn', label: 'is not' },
]

const CATEGORY_VALUE_OPTIONS = [
  { value: 'sales', label: 'Sales' },
  { value: 'processing', label: 'Processing' },
  { value: 'transfer', label: 'Transfer' },
]

const CategoryFilterTokenExample = (args: Pick<FilterTokenProps, 'onRemove'>) => {
  const [operator, setOperator] = useState('is')
  const [value, setValue] = useState('sales')

  return (
    <FilterToken
      {...args}
      field='Category'
      operator={operator}
      operatorOptions={CATEGORY_OPERATOR_OPTIONS}
      onOperatorChange={setOperator}
      valueType='enum'
      valueOptions={CATEGORY_VALUE_OPTIONS}
      value={value}
      onValueChange={setValue}
    />
  )
}

export const Default: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: (args) => (
    <Gallery gap={32}>
      <Col label='text-type value scenario'>
        <div>
          <AmountFilterTokenExample {...args} />
        </div>
      </Col>

      <Col label='enum-type value scenario'>
        <div>
          <CategoryFilterTokenExample {...args} />
        </div>
      </Col>
    </Gallery>
  ),
}
