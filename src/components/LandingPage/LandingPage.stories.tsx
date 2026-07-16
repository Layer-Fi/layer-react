import { type Meta, type StoryObj } from '@storybook/react-vite'

import { LandingPage } from '@components/LandingPage/LandingPage'
import {
  buildHeroOverrides,
  buildOfferingOverrides,
  type LandingPageStoryArgs,
  landingPageStoryArgTypes,
  landingPageStoryControlsInclude,
  landingPageStoryDefaultArgs,
} from '@components/LandingPage/landingPageStoryControls'

const meta: Meta<LandingPageStoryArgs> = {
  title: 'Components/LandingPage',
  parameters: {
    controls: { include: landingPageStoryControlsInclude },
  },
  args: landingPageStoryDefaultArgs,
  argTypes: landingPageStoryArgTypes,
  render: args => (
    <LandingPage
      platform={{ platformName: args.platformName, industry: args.industry }}
      availableOffers={args.availableOffers}
      heroOverrides={buildHeroOverrides(args)}
      offeringOverrides={buildOfferingOverrides(args)}
    />
  ),
}

export default meta

type Story = StoryObj<LandingPageStoryArgs>

export const Default: Story = {}

export const AccountingOnly: Story = {
  args: { availableOffers: ['accounting'] },
}

export const BookkeepingOnly: Story = {
  args: { availableOffers: ['bookkeeping'] },
}

export const FullyCustomized: Story = {
  args: {
    heroImageUrl: 'https://images.unsplash.com/photo-1734079692160-fcbe4be6ab96?auto=format&fit=crop&w=1600&q=80',
    heroTitle: 'Bookkeeping built for {{industry}}',
    heroSubtitle: 'Everything you need to run the books, inside {{platformName}}.',
    heroHeading1: 'Real-time profitability',
    heroHeading1Desc: 'See revenue, expenses, and profit update as you work.',
    heroHeading2: 'Tax-ready books',
    heroHeading2Desc: 'A year-end packet your accountant will love.',
    heroPrimaryCtaLabel: 'Talk to an expert',
    heroPrimaryCtaUrl: 'https://calendly.com/calendly-demo',
    heroSecondaryCtaLabel: 'See pricing',
    heroSecondaryCtaUrl: 'https://layerfi.com/pricing',
    offersSectionTitle: 'Pick the plan that fits your {{industry}} business',
    accountingBadge: 'Do it yourself',
    accountingTitle: '{{platformName}} Books',
    accountingSubtitle: 'Simple software for owners who like to stay hands-on.',
    accountingShowStartingAtLabel: true,
    bookkeepingBadge: 'Done for you',
    bookkeepingTitle: 'Concierge Bookkeeping',
    bookkeepingSubtitle: 'A dedicated bookkeeper closes your books every month.',
  },
}
