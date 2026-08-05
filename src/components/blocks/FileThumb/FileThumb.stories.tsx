import { type Meta, type StoryObj } from '@storybook/react-vite'

import { FileThumb } from '@blocks/FileThumb/FileThumb'

import { Col, Gallery } from '@testUtils/storybook/layout/gallery'

const meta: Meta<typeof FileThumb> = {
  title: 'Blocks/FileThumb',
  component: FileThumb,
}

export default meta

type Story = StoryObj<typeof FileThumb>

const noop = () => {}

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery direction='row' wrap gap={24}>
      <Col inlineSize={240} label='default, with actions'>
        <FileThumb
          name='receipt.pdf'
          date='Jul 24, 2026'
          enableOpen
          enableDownload
          onOpen={noop}
          onDelete={noop}
        />
      </Col>
      <Col inlineSize={240} label='uploading'>
        <FileThumb name='invoice.png' uploadPending onDelete={noop} />
      </Col>
      <Col inlineSize={240} label='deleting'>
        <FileThumb name='statement.pdf' deletePending onDelete={noop} />
      </Col>
      <Col inlineSize={240} label='error'>
        <FileThumb name='corrupt.pdf' error='Upload failed' onDelete={noop} />
      </Col>
    </Gallery>
  ),
}
