import { type Meta, type StoryObj } from '@storybook/react-vite'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@ui/Button/Button'
import {
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
} from '@ui/Calendar/Calendar'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'

const meta: Meta<typeof Calendar> = {
  title: 'UI/Calendar',
  component: Calendar,
}

export default meta

type Story = StoryObj<typeof Calendar>

const CalendarBody = () => (
  <>
    <HStack align='center' justify='space-between' pb='xs' pi='xs'>
      <Button icon inset variant='ghost' slot='previous'>
        <ChevronLeft size={20} />
      </Button>
      <Heading weight='normal' size='sm' />
      <Button icon inset variant='ghost' slot='next'>
        <ChevronRight size={20} />
      </Button>
    </HStack>
    <HStack pb='xs' pi='xs'>
      <CalendarGrid>
        <CalendarGridHeader>
          {day => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
        </CalendarGridHeader>
        <CalendarGridBody>
          {date => <CalendarCell date={date} />}
        </CalendarGridBody>
      </CalendarGrid>
    </HStack>
  </>
)

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <Calendar>
      <CalendarBody />
    </Calendar>
  ),
}

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', gap: 32, padding: 24 }}>
      <VStack gap='sm'>
        <Span size='sm' weight='bold'>Default</Span>
        <Calendar>
          <CalendarBody />
        </Calendar>
      </VStack>
      <VStack gap='sm'>
        <Span size='sm' weight='bold'>Read only</Span>
        <Calendar isReadOnly>
          <CalendarBody />
        </Calendar>
      </VStack>
    </div>
  ),
}
