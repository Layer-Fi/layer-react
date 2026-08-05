import { type Meta, type StoryObj } from '@storybook/react-vite'
import { Wifi } from 'lucide-react'

import { DataState, type DataStateProps, DataStateStatus } from '@ui/DataState/DataState'

import { Col } from '@testUtils/storybook/layout/Col'
import { Frame } from '@testUtils/storybook/layout/Frame'
import { Gallery } from '@testUtils/storybook/layout/Gallery'
import { Matrix } from '@testUtils/storybook/layout/Matrix'
import { Section } from '@testUtils/storybook/layout/Section'

const STATUSES = Object.values(DataStateStatus)

const noop = () => {}

const CELL_SIZE = 300

const BASE = {
  title: 'Something happened',
  description: 'A short description of the current state.',
} satisfies Partial<DataStateProps>

const ACTIONS: { label: string, props: Partial<DataStateProps> }[] = [
  { label: 'default', props: {} },
  { label: 'with refresh', props: { onRefresh: noop } },
  { label: 'refreshing', props: { onRefresh: noop, isLoading: true } },
]

const VARIATIONS: { label: string, props: Partial<DataStateProps> }[] = [
  {
    label: 'inline',
    props: {
      status: DataStateStatus.info,
      inline: true,
      title: 'Inline state',
      description: 'Rendered inline with smaller text.',
    },
  },
  {
    label: 'inline, with refresh',
    props: {
      status: DataStateStatus.failed,
      inline: true,
      title: 'Inline state',
      description: 'Rendered inline with a refresh action.',
      onRefresh: noop,
    },
  },
  { label: 'spacing', props: { status: DataStateStatus.info, spacing: true } },
  { label: 'custom icon', props: { status: DataStateStatus.failed, icon: <Wifi size={12} /> } },
  { label: 'title only', props: { status: DataStateStatus.allDone, description: undefined } },
  { label: 'description only', props: { status: DataStateStatus.info, title: undefined } },
]

const meta: Meta<typeof DataState> = {
  title: 'UI/DataState',
  component: DataState,
  args: {
    status: DataStateStatus.info,
    ...BASE,
  },
  argTypes: {
    status: { control: 'inline-radio', options: STATUSES },
    inline: { control: 'boolean' },
    spacing: { control: 'boolean' },
    isLoading: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof DataState>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery gap={40}>
      <Section title='Status and refresh action'>
        <Matrix
          rows={STATUSES}
          columns={ACTIONS}
          rowLabel={status => status}
          columnLabel={action => action.label}
          renderCell={(status, { props }) => (
            <Frame inlineSize={CELL_SIZE} padding={16}>
              <DataState status={status} {...BASE} {...props} />
            </Frame>
          )}
        />
      </Section>
      <Section title='Variations'>
        <Gallery direction='row' wrap gap={24} padding={0}>
          {VARIATIONS.map(({ label, props }) => (
            <Col key={label} label={label}>
              <Frame inlineSize={CELL_SIZE} padding={16}>
                <DataState status={DataStateStatus.info} {...BASE} {...props} />
              </Frame>
            </Col>
          ))}
        </Gallery>
      </Section>
    </Gallery>
  ),
}
