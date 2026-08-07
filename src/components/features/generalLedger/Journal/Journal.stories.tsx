import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingStatus'
import { EntryType } from '@schemas/features/generalLedger/ledgerEntry'
import { Badge, BadgeVariant } from '@ui/Badge/Badge'
import { Journal, type JournalProps } from '@features/generalLedger/Journal/Journal'

import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { ledgerEntries } from '@fixtures/generated/ledgerEntries.gen'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { get as getLedgerEntries } from '@msw/api/businesses/[business-id]/ledger/entries/get'
import { handlers } from '@msw/handlers'
import { findEntryRows } from '@testUtils/storybook/interactions/findEntryRows'

type JournalStoryArgs = {
  showTags: boolean
  showCustomerVendor: boolean
  componentTitle: string
  showInAppLinks: boolean
} & Pick<JournalProps, 'stringOverrides' | 'renderInAppLink'>

const meta: Meta<JournalStoryArgs> = {
  title: 'Components/Journal',
  tags: ['public-api'],
  component: Journal,
  parameters: {
    controls: {
      include: ['showTags', 'showCustomerVendor', 'stringOverrides.journalTable.componentTitle', 'renderInAppLink'],
    },
  },
  args: {
    showTags: true,
    showCustomerVendor: true,
    componentTitle: '',
    showInAppLinks: false,
  },
  argTypes: {
    stringOverrides: { table: { disable: true } },
    renderInAppLink: { table: { disable: true } },
    showTags: {
      control: 'boolean',
      description: 'Show transaction tags on journal entries',
    },
    showCustomerVendor: {
      control: 'boolean',
      description: 'Show customer/vendor columns on journal entries',
    },
    componentTitle: {
      name: 'stringOverrides.journalTable.componentTitle',
      control: 'text',
      description:
        'The real prop is `stringOverrides?: { journalTable?: { componentTitle?: string } }`. Type a '
        + 'value to override the table title, or leave it blank to omit the override and use the default.',
      table: {
        category: 'String overrides',
        type: { summary: '{ journalTable?: { componentTitle?: string } }' },
        defaultValue: { summary: 'Journal' },
      },
    },
    showInAppLinks: {
      name: 'renderInAppLink',
      control: 'boolean',
      description:
        'The real prop is the `renderInAppLink: (source: LinkingMetadata) => ReactNode` render prop. '
        + 'Toggle this on to provide it (an entry\'s source badge in the detail drawer becomes a '
        + 'clickable link to the source entity - an alert here) or off to omit it.',
      table: {
        category: 'Callbacks',
        type: { summary: '(source: LinkingMetadata) => ReactNode' },
      },
    },
  },
  render: ({ showTags, showCustomerVendor, componentTitle, showInAppLinks }) => (
    <Journal
      showTags={showTags}
      showCustomerVendor={showCustomerVendor}
      stringOverrides={componentTitle ? { journalTable: { componentTitle } } : undefined}
      renderInAppLink={showInAppLinks
        ? ({ entityName }) => (
          <Badge
            variant={BadgeVariant.INFO}
            tooltip={`Open ${entityName}`}
            onClick={() => window.alert(`Here is the ${entityName}!`)}
          >
            {entityName}
          </Badge>
        )
        : undefined}
    />
  ),
}

export default meta

type Story = StoryObj<JournalStoryArgs>

export const Default: Story = {
  tags: ['docs-screenshot'],
}

export const DrawerOpen: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  tags: ['docs-screenshot'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const [, firstEntry] = await findEntryRows(canvas)
    await userEvent.click(firstEntry)
    await canvas.findByText(/Journal Entry #/, undefined, { timeout: 10_000 })
  },
}

// Only manual entries offer the reverse action, and the fixtures put them past the first page.
const manualEntriesFirst = getLedgerEntries.mock(
  ledgerEntries.filter(entry => entry.entryType === EntryType.Manual),
)

async function openReverseAction(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const [, firstEntry] = await findEntryRows(canvas)
  await userEvent.click(firstEntry)
  await canvas.findByText(/Journal Entry #/, undefined, { timeout: 10_000 })
  return canvas.findByRole('button', { name: 'Reverse entry' })
}

// The global mock's status is NOT_PURCHASED, so reversing an entry is allowed.
export const ReverseEntry: Story = {
  parameters: {
    chromatic: { viewports: [1280] },
    msw: { handlers: [manualEntriesFirst, ...handlers] },
  },
  play: async ({ canvasElement }) => {
    const reverse = await openReverseAction(canvasElement)
    await expect(reverse).toBeEnabled()
  },
}

// ACTIVE (a bookkeeping client) disables reversing an entry.
export const ReverseEntryBookkeepingEnabled: Story = {
  parameters: {
    chromatic: { viewports: [1280] },
    msw: {
      handlers: [
        getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })),
        manualEntriesFirst,
        ...handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const reverse = await openReverseAction(canvasElement)
    await expect(reverse).toBeDisabled()
  },
}

export const DocsInAppLink: Story = {
  tags: ['!public-api', 'docs-screenshot'],
  render: () => (
    <Journal
      renderInAppLink={({ entityName }) => (
        <a
          href='https://layerfi.com'
          target='_blank'
          rel='noopener noreferrer'
          style={{ color: '#007bff', textDecoration: 'none', fontWeight: 500 }}
        >
          {entityName}
        </a>
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const rows = await findEntryRows(canvas)
    const entry = rows.find(row => row.textContent?.includes('Invoice payment'))
    if (!entry) throw new Error('no invoice payment entry is on the first page')

    await userEvent.click(entry)
    await canvas.findByText(/Journal Entry #/, undefined, { timeout: 10_000 })
  },
}
