import { type Meta, type StoryObj } from '@storybook/react-vite'

import { LandingPage } from '@components/LandingPage/LandingPage'
import { type DeepPartial, type HeroContentConfig, type LandingPageCardConfig } from '@components/LandingPage/types'

type LandingPageStoryArgs = {
  platformName: string
  industry: string
  availableOffers: ('accounting' | 'bookkeeping')[]
  heroTitle: string
  heroSubtitle: string
  heroHeading1: string
  heroHeading1Desc: string
  heroHeading2: string
  heroHeading2Desc: string
  heroImageUrl: string
  heroPrimaryCtaLabel: string
  heroPrimaryCtaUrl: string
  heroSecondaryCtaLabel: string
  heroSecondaryCtaUrl: string
  offersSectionTitle: string
  accountingBadge: string
  accountingTitle: string
  accountingSubtitle: string
  accountingPriceAmount: string
  accountingPriceUnit: string
  accountingShowStartingAtLabel: boolean
  accountingCtaLabel: string
  accountingCtaUrl: string
  bookkeepingBadge: string
  bookkeepingTitle: string
  bookkeepingSubtitle: string
  bookkeepingPriceAmount: string
  bookkeepingPriceUnit: string
  bookkeepingShowStartingAtLabel: boolean
  bookkeepingCtaLabel: string
  bookkeepingCtaUrl: string
}

const overrideArgType = (realProp: string, category: string) => ({
  name: realProp,
  control: 'text' as const,
  description: 'Leave blank to omit the override and use the default. Supports {{platformName}} and {{industry}} templates.',
  table: { category },
})

function buildHeroOverrides({
  heroTitle,
  heroSubtitle,
  heroHeading1,
  heroHeading1Desc,
  heroHeading2,
  heroHeading2Desc,
  heroImageUrl,
  heroPrimaryCtaLabel,
  heroPrimaryCtaUrl,
  heroSecondaryCtaLabel,
  heroSecondaryCtaUrl,
}: LandingPageStoryArgs): DeepPartial<HeroContentConfig> {
  return {
    stringOverrides: {
      ...(heroTitle ? { title: heroTitle } : {}),
      ...(heroSubtitle ? { subtitle: heroSubtitle } : {}),
      ...(heroHeading1 ? { heading1: heroHeading1 } : {}),
      ...(heroHeading1Desc ? { heading1Desc: heroHeading1Desc } : {}),
      ...(heroHeading2 ? { heading2: heroHeading2 } : {}),
      ...(heroHeading2Desc ? { heading2Desc: heroHeading2Desc } : {}),
    },
    ...(heroImageUrl ? { mediaUrls: { topOfFoldImage: heroImageUrl } } : {}),
    cta: {
      primary: {
        ...(heroPrimaryCtaLabel ? { label: heroPrimaryCtaLabel } : {}),
        ...(heroPrimaryCtaUrl ? { url: heroPrimaryCtaUrl } : {}),
      },
      secondary: {
        ...(heroSecondaryCtaLabel ? { label: heroSecondaryCtaLabel } : {}),
        ...(heroSecondaryCtaUrl ? { url: heroSecondaryCtaUrl } : {}),
      },
    },
  }
}

function buildCardOverrides(
  card: {
    badge: string
    title: string
    subtitle: string
    priceAmount: string
    priceUnit: string
    showStartingAtLabel: boolean
    ctaLabel: string
    ctaUrl: string
  },
): DeepPartial<LandingPageCardConfig> {
  return {
    stringOverrides: {
      ...(card.badge ? { badge: card.badge } : {}),
      ...(card.title ? { title: card.title } : {}),
      ...(card.subtitle ? { subtitle: card.subtitle } : {}),
      ...(card.priceAmount ? { priceAmount: card.priceAmount } : {}),
      ...(card.priceUnit ? { priceUnit: card.priceUnit } : {}),
    },
    cta: {
      primary: {
        ...(card.ctaLabel ? { label: card.ctaLabel } : {}),
        ...(card.ctaUrl ? { url: card.ctaUrl } : {}),
      },
    },
    showStartingAtLabel: card.showStartingAtLabel,
  }
}

const meta: Meta<LandingPageStoryArgs> = {
  title: 'Components/LandingPage',
  parameters: {
    controls: {
      include: [
        'platform.platformName',
        'platform.industry',
        'availableOffers',
        'heroOverrides.stringOverrides.title',
        'heroOverrides.stringOverrides.subtitle',
        'heroOverrides.stringOverrides.heading1',
        'heroOverrides.stringOverrides.heading1Desc',
        'heroOverrides.stringOverrides.heading2',
        'heroOverrides.stringOverrides.heading2Desc',
        'heroOverrides.mediaUrls.topOfFoldImage',
        'heroOverrides.cta.primary.label',
        'heroOverrides.cta.primary.url',
        'heroOverrides.cta.secondary.label',
        'heroOverrides.cta.secondary.url',
        'offeringOverrides.stringOverrides.sectionTitle',
        'offeringOverrides.accounting.stringOverrides.badge',
        'offeringOverrides.accounting.stringOverrides.title',
        'offeringOverrides.accounting.stringOverrides.subtitle',
        'offeringOverrides.accounting.stringOverrides.priceAmount',
        'offeringOverrides.accounting.stringOverrides.priceUnit',
        'offeringOverrides.accounting.showStartingAtLabel',
        'offeringOverrides.accounting.cta.primary.label',
        'offeringOverrides.accounting.cta.primary.url',
        'offeringOverrides.bookkeeping.stringOverrides.badge',
        'offeringOverrides.bookkeeping.stringOverrides.title',
        'offeringOverrides.bookkeeping.stringOverrides.subtitle',
        'offeringOverrides.bookkeeping.stringOverrides.priceAmount',
        'offeringOverrides.bookkeeping.stringOverrides.priceUnit',
        'offeringOverrides.bookkeeping.showStartingAtLabel',
        'offeringOverrides.bookkeeping.cta.primary.label',
        'offeringOverrides.bookkeeping.cta.primary.url',
      ],
    },
  },
  args: {
    platformName: 'Acme',
    industry: 'landscaping',
    availableOffers: ['accounting', 'bookkeeping'],
    heroTitle: '',
    heroSubtitle: '',
    heroHeading1: '',
    heroHeading1Desc: '',
    heroHeading2: '',
    heroHeading2Desc: '',
    heroImageUrl: '',
    heroPrimaryCtaLabel: '',
    heroPrimaryCtaUrl: '',
    heroSecondaryCtaLabel: '',
    heroSecondaryCtaUrl: '',
    offersSectionTitle: '',
    accountingBadge: '',
    accountingTitle: '',
    accountingSubtitle: '',
    accountingPriceAmount: '$20',
    accountingPriceUnit: '/mo',
    accountingShowStartingAtLabel: false,
    accountingCtaLabel: 'Get started',
    accountingCtaUrl: 'https://layerfi.com',
    bookkeepingBadge: '',
    bookkeepingTitle: '',
    bookkeepingSubtitle: '',
    bookkeepingPriceAmount: '$299',
    bookkeepingPriceUnit: '/mo',
    bookkeepingShowStartingAtLabel: true,
    bookkeepingCtaLabel: 'Book a call',
    bookkeepingCtaUrl: 'https://calendly.com/acme/bookkeeping-intro',
  },
  argTypes: {
    platformName: {
      name: 'platform.platformName',
      control: 'text',
      description: 'Brand name substituted into all {{platformName}} templates',
      table: { category: 'Platform' },
    },
    industry: {
      name: 'platform.industry',
      control: 'text',
      description: 'Industry substituted into all {{industry}} templates',
      table: { category: 'Platform' },
    },
    availableOffers: {
      control: 'check',
      options: ['accounting', 'bookkeeping'],
      description: 'Which offer cards render in the offers section',
      table: { category: 'Platform' },
    },
    heroTitle: overrideArgType('heroOverrides.stringOverrides.title', 'Hero'),
    heroSubtitle: overrideArgType('heroOverrides.stringOverrides.subtitle', 'Hero'),
    heroHeading1: overrideArgType('heroOverrides.stringOverrides.heading1', 'Hero'),
    heroHeading1Desc: overrideArgType('heroOverrides.stringOverrides.heading1Desc', 'Hero'),
    heroHeading2: overrideArgType('heroOverrides.stringOverrides.heading2', 'Hero'),
    heroHeading2Desc: overrideArgType('heroOverrides.stringOverrides.heading2Desc', 'Hero'),
    heroImageUrl: overrideArgType('heroOverrides.mediaUrls.topOfFoldImage', 'Hero'),
    heroPrimaryCtaLabel: overrideArgType('heroOverrides.cta.primary.label', 'Hero CTAs'),
    heroPrimaryCtaUrl: overrideArgType('heroOverrides.cta.primary.url', 'Hero CTAs'),
    heroSecondaryCtaLabel: overrideArgType('heroOverrides.cta.secondary.label', 'Hero CTAs'),
    heroSecondaryCtaUrl: overrideArgType('heroOverrides.cta.secondary.url', 'Hero CTAs'),
    offersSectionTitle: overrideArgType('offeringOverrides.stringOverrides.sectionTitle', 'Offers section'),
    accountingBadge: overrideArgType('offeringOverrides.accounting.stringOverrides.badge', 'Accounting card'),
    accountingTitle: overrideArgType('offeringOverrides.accounting.stringOverrides.title', 'Accounting card'),
    accountingSubtitle: overrideArgType('offeringOverrides.accounting.stringOverrides.subtitle', 'Accounting card'),
    accountingPriceAmount: overrideArgType('offeringOverrides.accounting.stringOverrides.priceAmount', 'Accounting card'),
    accountingPriceUnit: overrideArgType('offeringOverrides.accounting.stringOverrides.priceUnit', 'Accounting card'),
    accountingShowStartingAtLabel: {
      name: 'offeringOverrides.accounting.showStartingAtLabel',
      control: 'boolean',
      table: { category: 'Accounting card' },
    },
    accountingCtaLabel: overrideArgType('offeringOverrides.accounting.cta.primary.label', 'Accounting card'),
    accountingCtaUrl: overrideArgType('offeringOverrides.accounting.cta.primary.url', 'Accounting card'),
    bookkeepingBadge: overrideArgType('offeringOverrides.bookkeeping.stringOverrides.badge', 'Bookkeeping card'),
    bookkeepingTitle: overrideArgType('offeringOverrides.bookkeeping.stringOverrides.title', 'Bookkeeping card'),
    bookkeepingSubtitle: overrideArgType('offeringOverrides.bookkeeping.stringOverrides.subtitle', 'Bookkeeping card'),
    bookkeepingPriceAmount: overrideArgType('offeringOverrides.bookkeeping.stringOverrides.priceAmount', 'Bookkeeping card'),
    bookkeepingPriceUnit: overrideArgType('offeringOverrides.bookkeeping.stringOverrides.priceUnit', 'Bookkeeping card'),
    bookkeepingShowStartingAtLabel: {
      name: 'offeringOverrides.bookkeeping.showStartingAtLabel',
      control: 'boolean',
      table: { category: 'Bookkeeping card' },
    },
    bookkeepingCtaLabel: overrideArgType('offeringOverrides.bookkeeping.cta.primary.label', 'Bookkeeping card'),
    bookkeepingCtaUrl: overrideArgType('offeringOverrides.bookkeeping.cta.primary.url', 'Bookkeeping card'),
  },
  render: args => (
    <LandingPage
      platform={{ platformName: args.platformName, industry: args.industry }}
      availableOffers={args.availableOffers}
      heroOverrides={buildHeroOverrides(args)}
      offeringOverrides={{
        ...(args.offersSectionTitle ? { stringOverrides: { sectionTitle: args.offersSectionTitle } } : {}),
        accounting: buildCardOverrides({
          badge: args.accountingBadge,
          title: args.accountingTitle,
          subtitle: args.accountingSubtitle,
          priceAmount: args.accountingPriceAmount,
          priceUnit: args.accountingPriceUnit,
          showStartingAtLabel: args.accountingShowStartingAtLabel,
          ctaLabel: args.accountingCtaLabel,
          ctaUrl: args.accountingCtaUrl,
        }),
        bookkeeping: buildCardOverrides({
          badge: args.bookkeepingBadge,
          title: args.bookkeepingTitle,
          subtitle: args.bookkeepingSubtitle,
          priceAmount: args.bookkeepingPriceAmount,
          priceUnit: args.bookkeepingPriceUnit,
          showStartingAtLabel: args.bookkeepingShowStartingAtLabel,
          ctaLabel: args.bookkeepingCtaLabel,
          ctaUrl: args.bookkeepingCtaUrl,
        }),
      }}
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
    heroTitle: 'Bookkeeping built for {{industry}}',
    heroSubtitle: 'Everything you need to run the books, inside {{platformName}}.',
    heroHeading1: 'Real-time profitability',
    heroHeading1Desc: 'See revenue, expenses, and profit update as you work.',
    heroHeading2: 'Tax-ready books',
    heroHeading2Desc: 'A year-end packet your accountant will love.',
    heroPrimaryCtaLabel: 'Talk to an expert',
    heroPrimaryCtaUrl: 'https://calendly.com/acme/expert-intro',
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
