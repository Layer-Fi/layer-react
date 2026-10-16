import { useState } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { screen, userEvent, within } from 'storybook/test'

import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingStatus'
import { type DateRange } from '@utils/shared/date/dateRange'
import { BREAKPOINTS } from '@utils/shared/size/screenSizeBreakpoints'
import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Tasks } from '@features/bookkeeping/Tasks/Tasks'
import { TasksListItem } from '@features/bookkeeping/TasksListItem/TasksListItem'
import { TasksTakeover } from '@features/bookkeeping/TasksTakeover/TasksTakeover'

import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import {
  askTransactions,
  choiceOptions,
  choiceStep,
  fixtureId,
  makeUnifiedAskFormTask,
  page,
  singlePageForm,
} from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { handlers } from '@msw/handlers'
import { PinnedGlobalDateRange } from '@testUtils/storybook/decorators/PinnedGlobalDateRange'

// October holds the account-mask ask, which carries a subtitle and page intro/description in its fixture.
const OCTOBER: DateRange = {
  startDate: new Date(FIXTURE_YEAR, 9, 1),
  endDate: new Date(FIXTURE_YEAR, 9, 31),
}

const MOBILE = { chromatic: { viewports: [BREAKPOINTS.MOBILE - 1] } }

const openTakeover = async (canvasElement: HTMLElement) => {
  await userEvent.click(await within(canvasElement).findByText('New account transfer'))
  await screen.findByRole('heading', { name: 'New account transfer' })
}

const meta: Meta<typeof Tasks> = {
  title: 'Scratch/Tasks subtitles and page paragraphs',
  component: Tasks,
  parameters: {
    msw: { handlers: [getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })), ...handlers] },
  },
  decorators: [
    Story => (
      <PinnedGlobalDateRange dateRange={OCTOBER}>
        <div style={{ display: 'grid', paddingBlock: '2rem', paddingInline: '1rem' }}>
          <div style={{ display: 'grid', minInlineSize: '20rem', maxInlineSize: '48rem' }}>
            <Story />
          </div>
        </div>
      </PinnedGlobalDateRange>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof Tasks>

/** Desktop list: subtitle in the row, then intro, transactions, description, and the question inside the expanded task. */
export const DesktopAccountMask: Story = {
  parameters: { chromatic: { viewports: [1280] } },
}

/** Mobile takeover: subtitle under the title, intro, transactions, description, question. */
export const MobileTakeoverAccountMask: Story = {
  parameters: MOBILE,
  args: { mobile: true },
  play: async ({ canvasElement }) => {
    await openTakeover(canvasElement)
  },
}

/** The "Task N of M" drawer over the takeover, with subtitles on its rows. */
export const MobileTakeoverTaskList: Story = {
  parameters: MOBILE,
  args: { mobile: true },
  play: async ({ canvasElement }) => {
    await openTakeover(canvasElement)
    await userEvent.click(screen.getByRole('button', { name: /^Task \d+ of/ }))
    await screen.findByText('Open')
  },
}

/** The connect page after picking "Another account my business owns": the intro changes with the page. */
export const MobileTakeoverConnectPage: Story = {
  parameters: MOBILE,
  args: { mobile: true },
  play: async ({ canvasElement }) => {
    await openTakeover(canvasElement)
    await userEvent.click(screen.getByRole('radio', { name: 'Another account my business owns' }))
    await screen.findByRole('button', { name: 'Connect account' })
  },
}

type ParagraphCase = { intro: boolean, description: boolean, transactions: boolean }

const paragraphCaseLabel = ({ intro, description, transactions }: ParagraphCase) => {
  const paragraphs = intro && description ? 'Both' : intro ? 'Intro only' : description ? 'Description only' : 'Neither'
  return `${paragraphs} · ${transactions ? 'with transactions' : 'no transactions'}`
}

const makeParagraphCaseTask = (paragraphCase: ParagraphCase, index: number) => {
  const { intro, description, transactions } = paragraphCase

  return makeUnifiedAskFormTask({
    id: fixtureId(`d${index}`),
    title: 'Costco purchases',
    subtitle: '2 transactions · $836.45',
    transactions: transactions
      ? askTransactions(10, [
        { id: `d${index}1`, day: 2, amount: -61250, description: 'COSTCO WHSE #1042' },
        { id: `d${index}2`, day: 18, amount: -22395, description: 'COSTCO GAS #1042' },
      ])
      : [],
    form: singlePageForm({
      ...page('only', [choiceStep('category', 'What were these purchases for?', choiceOptions({
        office: 'Office expenses',
        meals: 'Business meals',
        other: 'Something else',
      }))]),
      intro: intro ? 'Two Costco charges came in this month that we haven’t categorized yet.' : undefined,
      description: description ? 'Pick the closest match. You can split them by transaction on the next page.' : undefined,
    }),
  })
}

const PARAGRAPH_CASES: ParagraphCase[] = [true, false].flatMap(transactions => [
  { intro: true, description: true, transactions },
  { intro: true, description: false, transactions },
  { intro: false, description: true, transactions },
  { intro: false, description: false, transactions },
])

/** Every combination of page intro and description, with and without a transaction table, in the inline desktop form. */
export const ParagraphCombinations: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  // Bare list items sit outside the Tasks root, so the story supplies the root class and list wrapper itself.
  render: () => (
    <div className='Layer__component'>
      <VStack gap='xl'>
        {PARAGRAPH_CASES.map((paragraphCase, index) => (
          <VStack key={index} gap='xs'>
            <Heading size='xs'>{paragraphCaseLabel(paragraphCase)}</Heading>
            <VStack className='Layer__tasks-list'>
              <TasksListItem task={makeParagraphCaseTask(paragraphCase, index)} defaultOpen />
            </VStack>
          </VStack>
        ))}
      </VStack>
    </div>
  ),
}

type ParagraphTakeoverProps = ParagraphCase

const ParagraphTakeover = (paragraphCase: ParagraphTakeoverProps) => {
  const task = makeParagraphCaseTask(paragraphCase, 9)
  const [taskId, setTaskId] = useState<string | null>(task.id)

  return <TasksTakeover tasks={[task]} taskId={taskId} onTaskChange={setTaskId} />
}

/** The same matrix in the mobile takeover. Flip the three controls to compare combinations. */
export const MobileTakeoverParagraphCombinations: StoryObj<ParagraphTakeoverProps> = {
  parameters: { ...MOBILE, controls: { include: ['intro', 'description', 'transactions'] } },
  args: { intro: true, description: true, transactions: true },
  argTypes: {
    intro: { control: 'boolean' },
    description: { control: 'boolean' },
    transactions: { control: 'boolean' },
  },
  render: args => <ParagraphTakeover {...args} />,
}
