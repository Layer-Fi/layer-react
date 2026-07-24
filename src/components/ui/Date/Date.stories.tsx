import { parseDate } from '@internationalized/date'
import { type Meta, type StoryObj } from '@storybook/react-vite'

import { DateField, DateInput, DateSegment } from '@ui/Date/Date'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

const VALUE = parseDate('2026-07-23')

const meta: Meta<typeof DateField> = {
  title: 'UI/Date',
  component: DateField,
}

export default meta

type Story = StoryObj<typeof DateField>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <DateField defaultValue={VALUE}>
      <DateInput inset>
        {segment => <DateSegment segment={segment} />}
      </DateInput>
    </DateField>
  ),
}

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, width: 240 }}>
      <VStack gap='2xs'>
        <Span size='sm' weight='bold'>With value</Span>
        <DateField defaultValue={VALUE}>
          <DateInput inset>
            {segment => <DateSegment segment={segment} />}
          </DateInput>
        </DateField>
      </VStack>
      <VStack gap='2xs'>
        <Span size='sm' weight='bold'>Empty</Span>
        <DateField>
          <DateInput inset>
            {segment => <DateSegment segment={segment} />}
          </DateInput>
        </DateField>
      </VStack>
      <VStack gap='2xs'>
        <Span size='sm' weight='bold'>Read only</Span>
        <DateField defaultValue={VALUE} isReadOnly>
          <DateInput inset>
            {segment => <DateSegment segment={segment} isReadOnly />}
          </DateInput>
        </DateField>
      </VStack>
      <VStack gap='2xs'>
        <Span size='sm' weight='bold'>Inline</Span>
        <DateField defaultValue={VALUE} inline>
          <DateInput inset>
            {segment => <DateSegment segment={segment} />}
          </DateInput>
        </DateField>
      </VStack>
    </div>
  ),
}
