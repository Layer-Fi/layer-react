import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { BREAKPOINTS } from '@utils/shared/size/screenSizeBreakpoints'
import { AccountingOverview, type AccountingOverviewProps } from '@views/AccountingOverview/AccountingOverview'

import { makeBankAccountWithMirroredExternalAccount, markAccountReadyForRefresh } from '@fixtures/bankAccounts/mocks'
import { get as getBankAccounts } from '@msw/api/businesses/[business-id]/bank-accounts/get'
import { CUSTOM_CHART_CONFIG } from '@testUtils/storybook/controls/chartConfig'
import {
  buildSummariesSlotProps,
  buildSummariesStringOverrides,
  makeSummariesStoryControls,
  type SummariesStoryArgs,
  summariesStoryDefaultArgs,
} from '@testUtils/storybook/controls/summaries'
import { profitAndLossStoryHandlers, withOverviewStoryContext } from '@testUtils/storybook/decorators/profitAndLoss'

type AccountingOverviewStoryArgs = SummariesStoryArgs
  & Pick<AccountingOverviewProps, 'showTitle' | 'onAccountUpdateClick'>
  & { chartConfig?: ProfitAndLossChartConfig }

const summariesControls = makeSummariesStoryControls({
  stringOverridesPath: 'stringOverrides.profitAndLoss.summaries',
  slotPropsPath: 'slotProps.profitAndLoss.summaries',
  category: 'P&L summaries',
})

const meta: Meta<AccountingOverviewStoryArgs> = {
  title: 'Views/Overview/Accounting',
  component: AccountingOverview,
  parameters: {
    msw: { handlers: profitAndLossStoryHandlers },
    controls: { include: ['showTitle', ...summariesControls.controlNames] },
  },
  decorators: [withOverviewStoryContext],
  args: {
    showTitle: true,
    onAccountUpdateClick: fn(),
    ...summariesStoryDefaultArgs,
  },
  argTypes: {
    showTitle: {
      control: 'boolean',
      description: 'Show the view title and month picker header',
    },
    chartConfig: { table: { disable: true } },
    ...summariesControls.argTypes,
  },
  render: args => (
    <AccountingOverview
      showTitle={args.showTitle}
      onAccountUpdateClick={args.onAccountUpdateClick}
      stringOverrides={{ profitAndLoss: { summaries: buildSummariesStringOverrides(args) } }}
      slotProps={{
        profitAndLoss: {
          summaries: { ...buildSummariesSlotProps(args), chartConfig: args.chartConfig },
          chart: { chartConfig: args.chartConfig },
          detailedCharts: {
            revenue: { chartConfig: args.chartConfig },
            expenses: { chartConfig: args.chartConfig },
          },
        },
      }}
    />
  ),
}

export default meta

type Story = StoryObj<AccountingOverviewStoryArgs>

export const Default: Story = {
  tags: ['public-api', 'docs-screenshot', 'real-backend'],
}

export const CustomChartConfig: Story = {
  args: { chartConfig: CUSTOM_CHART_CONFIG },
}

const accountNeedingReconnection = markAccountReadyForRefresh(makeBankAccountWithMirroredExternalAccount({
  id: '00000001-b730-442c-8d79-cb0f139d1320',
  externalAccountId: '469aa9b2-35e4-509f-8c7d-061a6fa33d20',
  name: 'RBC Checking',
  institution: 'RBC',
  mask: '4048',
  balance: 2_500_000,
  externalAccountOverrides: {
    connectionExternalId: 'plaid_rbc_4048',
    lastSyncedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
}))

export const AccountReconnectionBanner: Story = {
  parameters: {
    msw: {
      handlers: [
        getBankAccounts.mock([accountNeedingReconnection]),
        ...profitAndLossStoryHandlers,
      ],
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    await canvas.findByText('RBC Checking (4048) is ready for refresh', {}, { timeout: 5000 })
    await canvas.findByText('Last refreshed 3 days ago', {}, { timeout: 5000 })

    const isMobile = canvasElement.getBoundingClientRect().width <= BREAKPOINTS.MOBILE
    const button = await canvas.findByRole('button', {
      name: isMobile ? 'Refresh Now' : 'RBC Checking (4048) is ready for refresh',
    }, { timeout: 5000 })

    await userEvent.click(button)
    await expect(args.onAccountUpdateClick).toHaveBeenCalledTimes(1)
  },
}

export const AccountReconnectionBannerWithDefaultReconnect: Story = {
  tags: ['docs-screenshot'],
  args: { onAccountUpdateClick: undefined },
  parameters: {
    msw: {
      handlers: [
        getBankAccounts.mock([accountNeedingReconnection]),
        ...profitAndLossStoryHandlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByText('RBC Checking (4048) is ready for refresh', {}, { timeout: 5000 })
  },
}

export const NoAccountNeedingReconnection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByText('$37,935.00', {}, { timeout: 5000 })
    await expect(canvas.queryByText(/is ready for refresh/)).not.toBeInTheDocument()
  },
}

const secondAccountNeedingReconnection = markAccountReadyForRefresh(makeBankAccountWithMirroredExternalAccount({
  id: '00000001-b730-442c-8d79-cb0f139d1321',
  externalAccountId: '469aa9b2-35e4-509f-8c7d-061a6fa33d21',
  name: 'Chase Checking',
  institution: 'Chase',
  mask: '1234',
  balance: 1_000_000,
  externalAccountOverrides: {
    connectionExternalId: 'plaid_chase_1234',
    lastSyncedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
}))

export const MultipleAccountsNeedingReconnection: Story = {
  parameters: {
    msw: {
      handlers: [
        getBankAccounts.mock([accountNeedingReconnection, secondAccountNeedingReconnection]),
        ...profitAndLossStoryHandlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByText('RBC Checking (4048) is ready for refresh', {}, { timeout: 5000 })
    await expect(canvas.queryByText('Chase Checking (1234) is ready for refresh')).not.toBeInTheDocument()
  },
}
