import { type Meta, type StoryObj } from '@storybook/react-vite'
import { Star } from 'lucide-react'

import { Banner, BannerButton, type BannerProps } from '@ui/Banner/Banner'

const BANNER_VARIANTS = ['default', 'info', 'warning', 'error', 'success'] as const

type BannerStoryArgs = Pick<BannerProps, 'variant' | 'title' | 'description' | 'ariaLabel'> & {
  icon: 'default' | 'hidden' | 'custom'
  showButton: boolean
  buttonLabel: string
  content: string
}

const meta: Meta<BannerStoryArgs> = {
  title: 'UI/Banner',
  component: Banner,
  parameters: {
    controls: {
      include: ['variant', 'title', 'description', 'slots.Icon', 'slots.Button', 'buttonLabel', 'ariaLabel', 'children'],
    },
  },
  args: {
    variant: 'info',
    title: 'Your books are ready',
    description: 'The March close is complete and ready for review.',
    icon: 'default',
    showButton: false,
    buttonLabel: 'Review',
    ariaLabel: '',
    content: '',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: BANNER_VARIANTS,
      description: 'Visual style; also drives the default icon and aria role',
    },
    title: {
      control: 'text',
      description: 'Heading text; clear it and the description to render children instead',
    },
    description: {
      control: 'text',
      description: 'Supporting text under the title',
    },
    icon: {
      name: 'slots.Icon',
      control: 'inline-radio',
      options: ['default', 'hidden', 'custom'],
      description: 'Default variant icon, no icon (slots.Icon = null), or a custom node',
      table: { category: 'Slots' },
    },
    showButton: {
      name: 'slots.Button',
      control: 'boolean',
      description: 'Render an action button in the trailing slot',
      table: { category: 'Slots' },
    },
    buttonLabel: {
      control: 'text',
      description: 'Label for the slots.Button action',
      table: { category: 'Slots' },
    },
    ariaLabel: {
      control: 'text',
      description: 'aria-label for the region role; only applies to the default variant',
    },
    content: {
      name: 'children',
      control: 'text',
      description: 'Fallback content, rendered only when title and description are empty',
    },
  },
  decorators: [
    Story => (
      <div className='Layer__component' style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
  render: ({ icon, showButton, buttonLabel, content, ...props }) => (
    <Banner
      {...props}
      slots={{
        ...(icon === 'hidden' ? { Icon: null } : {}),
        ...(icon === 'custom' ? { Icon: <Star size={20} /> } : {}),
        ...(showButton
          ? { Button: <BannerButton onPress={() => window.alert('Banner action')}>{buttonLabel}</BannerButton> }
          : {}),
      }}
    >
      {content}
    </Banner>
  ),
}

export default meta

type Story = StoryObj<BannerStoryArgs>

export const Default: Story = {}

export const ErrorVariant: Story = {
  name: 'Error',
  args: {
    variant: 'error',
    title: 'Sync failed',
    description: 'We could not refresh your accounts. Try again or contact support.',
    showButton: true,
    buttonLabel: 'Retry',
  },
}
