import { useState } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import { DateGroupBy } from '@schemas/features/unifiedReports/unifiedReport'
import { VStack } from '@ui/Stack/Stack'
import { DateGroupByComboBox } from '@blocks/DatePickers/DateSelection/DateGroupByComboBox'

const DateGroupByComboBoxHarness = () => {
  const [value, setValue] = useState<DateGroupBy | null>(DateGroupBy.Quarter)

  return (
    <VStack pi='md' pb='md'>
      <DateGroupByComboBox value={value} onValueChange={setValue} />
    </VStack>
  )
}

const meta: Meta<typeof DateGroupByComboBoxHarness> = {
  title: 'Blocks/DatePickers/DateGroupByComboBox',
  component: DateGroupByComboBoxHarness,
}

export default meta

type Story = StoryObj<typeof DateGroupByComboBoxHarness>

export const QuarterSelected: Story = {}

export const OptionsOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(await canvas.findByRole('combobox'))
    await within(canvasElement.ownerDocument.body).findByRole('option', { name: 'Quarter' })
  },
}
