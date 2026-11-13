import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Banner, BannerButton, type BannerProps, type BannerVariant } from '@ui/Banner/Banner'

const VARIANTS: BannerVariant[] = ['default', 'info', 'warning', 'error', 'success']
const SIZES: NonNullable<BannerProps['size']>[] = ['md', 'sm']

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

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24, maxWidth: 640 }}>
      {VARIANTS.flatMap(variant => SIZES.map(size => (
        <Banner
          key={`${variant}-${size}`}
          variant={variant}
          size={size}
          title={`${variant} banner (${size})`}
          description='A short description that explains the notification.'
          slots={{ Button: <BannerButton>Action</BannerButton> }}
        />
      )))}
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
