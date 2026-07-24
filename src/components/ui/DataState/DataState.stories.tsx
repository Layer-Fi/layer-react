import { Fragment } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { Wifi } from 'lucide-react'

import { DataState, type DataStateProps, DataStateStatus } from '@ui/DataState/DataState'

const STATUSES = Object.values(DataStateStatus)

const noop = () => {}

// DataState centres its text when not inline, so the examples need a fixed width to
// read as the empty/error panels they stand in for.
const CELL: React.CSSProperties = {
  inlineSize: 300,
  padding: 16,
  border: '1px dotted rgb(0 0 0 / 24%)',
  borderRadius: 8,
}

const LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  opacity: 0.55,
}

const HEADING: React.CSSProperties = { fontSize: 13, fontWeight: 700 }

const SECTION: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12 }

const BASE = {
  title: 'Something happened',
  description: 'A short description of the current state.',
} satisfies Partial<DataStateProps>

const ACTION_COLUMNS: { label: string, props: Partial<DataStateProps> }[] = [
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
    titleSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, padding: 24 }}>
      <section style={SECTION}>
        <span style={HEADING}>Status and refresh action</span>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `80px repeat(${ACTION_COLUMNS.length}, max-content)`,
            gap: '16px 24px',
            alignItems: 'center',
            justifyItems: 'start',
          }}
        >
          <span />
          {ACTION_COLUMNS.map(({ label }) => <span key={label} style={LABEL}>{label}</span>)}
          {STATUSES.map(status => (
            <Fragment key={status}>
              <span style={LABEL}>{status}</span>
              {ACTION_COLUMNS.map(({ label, props }) => (
                <div key={label} style={CELL}>
                  <DataState status={status} {...BASE} {...props} />
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </section>

      <section style={SECTION}>
        <span style={HEADING}>Variations</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
          {VARIATIONS.map(({ label, props }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={LABEL}>{label}</span>
              <div style={CELL}>
                <DataState status={DataStateStatus.info} {...BASE} {...props} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
}
