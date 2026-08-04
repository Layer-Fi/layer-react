import { type Meta, type StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import { Badge, BadgeVariant } from '@ui/Badge/Badge'
import { Journal, type JournalProps } from '@features/generalLedger/Journal/Journal'

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
  // Docs captures this at desktop only, and the interaction is desktop-shaped:
  // the header collapses to icon buttons below the tablet breakpoint.
  parameters: { chromatic: { viewports: [1280] } },
  tags: ['docs-screenshot'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Wait for entries to land before clicking: the table re-renders as they arrive and
    // would detach the row. Click exactly once — a second click closes the sidebar, so
    // retrying the click inside waitFor just toggles it open and shut.
    await canvas.findByText('1040')
    const [, firstEntry] = await canvas.findAllByRole('row')
    await userEvent.click(firstEntry)
    await canvas.findByText(/Journal Entry #/, undefined, { timeout: 10_000 })
  },
}
