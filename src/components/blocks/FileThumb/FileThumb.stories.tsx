import { type Meta, type StoryObj } from '@storybook/react-vite'

import { FileThumb } from '@blocks/FileThumb/FileThumb'

const meta: Meta<typeof FileThumb> = {
  title: 'Blocks/FileThumb',
  component: FileThumb,
}

export default meta

type Story = StoryObj<typeof FileThumb>

const noop = () => {}

const label: React.CSSProperties = { fontSize: 12, opacity: 0.6 }

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, padding: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 240 }}>
        <span style={label}>default, with actions</span>
        <FileThumb
          name='receipt.pdf'
          date='Jul 24, 2026'
          enableOpen
          enableDownload
          onOpen={noop}
          onDelete={noop}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 240 }}>
        <span style={label}>uploading</span>
        <FileThumb name='invoice.png' uploadPending onDelete={noop} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 240 }}>
        <span style={label}>deleting</span>
        <FileThumb name='statement.pdf' deletePending onDelete={noop} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 240 }}>
        <span style={label}>error</span>
        <FileThumb name='corrupt.pdf' error='Upload failed' onDelete={noop} />
      </div>
    </div>
  ),
}
