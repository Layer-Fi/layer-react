import { type Meta, type StoryObj } from '@storybook/react-vite'
import { ChartNoAxesColumn, CircleAlert, FileText, Receipt } from 'lucide-react'

import { Badge, BadgeSize, BadgeVariant } from '@ui/Badge/Badge'
import { Tabs } from '@ui/Tabs/Tabs'

import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'

const OPTIONS = [
  { label: 'Overview', value: 'overview' },
  { label: 'Transactions', value: 'transactions' },
  { label: 'Reports', value: 'reports' },
]

const WITH_ICONS = [
  { label: 'Overview', value: 'overview', leftIcon: <ChartNoAxesColumn size={14} /> },
  { label: 'Transactions', value: 'transactions', leftIcon: <Receipt size={14} /> },
  { label: 'Reports', value: 'reports', leftIcon: <FileText size={14} /> },
]

const WITH_BADGES = [
  { label: 'Overview', value: 'overview' },
  {
    label: 'To review',
    value: 'to-review',
    badge: (
      <Badge size={BadgeSize.SMALL} variant={BadgeVariant.WARNING} icon={<CircleAlert size={12} />}>
        12 tasks
      </Badge>
    ),
  },
  {
    label: 'Categorized',
    value: 'categorized',
    badge: <Badge size={BadgeSize.SMALL} variant={BadgeVariant.SUCCESS}>48</Badge>,
  },
]

const noop = () => {}

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  args: {
    name: 'tabs',
    options: OPTIONS,
    selected: 'overview',
    onChange: noop,
  },
}

export default meta

type Story = StoryObj<typeof Tabs>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery>
      <Col label='first selected'>
        <Tabs name='first' options={OPTIONS} selected='overview' onChange={noop} />
      </Col>
      <Col label='last selected, with a disabled tab'>
        <Tabs
          name='last-with-disabled'
          options={[...OPTIONS, { label: 'Archived', value: 'archived', disabled: true }]}
          selected='reports'
          onChange={noop}
        />
      </Col>
      <Col label='with left icons'>
        <Tabs name='with-icons' options={WITH_ICONS} selected='transactions' onChange={noop} />
      </Col>
      <Col label='with badges, selected and unselected'>
        <Tabs name='with-badges' options={WITH_BADGES} selected='to-review' onChange={noop} />
      </Col>
    </Gallery>
  ),
}
