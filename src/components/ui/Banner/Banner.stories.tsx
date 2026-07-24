import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Banner, BannerButton, type BannerVariant } from '@ui/Banner/Banner'

const VARIANTS: BannerVariant[] = ['default', 'info', 'warning', 'error', 'success']

const meta: Meta<typeof Banner> = {
  title: 'UI/Banner',
  component: Banner,
  args: {
    variant: 'info',
    title: 'Banner title',
    description: 'A short description that explains the notification.',
  },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
  },
}

export default meta

type Story = StoryObj<typeof Banner>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
}

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24, maxWidth: 640 }}>
      {VARIANTS.map(variant => (
        <Banner
          key={variant}
          variant={variant}
          title={`${variant} banner`}
          description='A short description that explains the notification.'
          slots={{ Button: <BannerButton>Action</BannerButton> }}
        />
      ))}
      <Banner
        variant='info'
        title='Title only'
      />
      <Banner
        variant='success'
        title='No icon'
        description='Icon slot explicitly set to null.'
        slots={{ Icon: null }}
      />
    </div>
  ),
}
