import { type Meta } from '@storybook/react-vite'

import { DEFAULT_FEATURE_VISIBILITY } from '@providers/BankTransactionsFeatureVisibility/BankTransactionsFeatureVisibilityProvider'
import { type MobileComponentType } from '@components/BankTransactions/constants'

// The bank-transactions props shared by every component that embeds the
// transactions table (BankTransactions, BankTransactionsWithLinkedAccounts).
export type BankTransactionsStoryArgs = {
  showCategorizationRules: boolean
  showCustomerVendor: boolean
  showDescriptions: boolean
  showReceiptUploads: boolean
  showTags: boolean
  showTooltips: boolean
  showUploadOptions: boolean
  mobileComponent: MobileComponentType
}

const FEATURE_TOGGLES = [
  'showCategorizationRules',
  'showCustomerVendor',
  'showDescriptions',
  'showReceiptUploads',
  'showTags',
  'showTooltips',
  'showUploadOptions',
] as const

export const bankTransactionsStoryDefaultArgs: BankTransactionsStoryArgs = {
  ...Object.fromEntries(FEATURE_TOGGLES.map(key => [key, DEFAULT_FEATURE_VISIBILITY[key]])) as
    Pick<BankTransactionsStoryArgs, typeof FEATURE_TOGGLES[number]>,
  mobileComponent: 'regularList',
}

type BankTransactionsArgTypes = NonNullable<Meta<BankTransactionsStoryArgs>['argTypes']>

export const makeBankTransactionsStoryControls = ({ category }: { category?: string } = {}) => {
  const argTypes: BankTransactionsArgTypes = {
    ...Object.fromEntries(FEATURE_TOGGLES.map(key => [
      key,
      { control: 'boolean' as const, table: { category } },
    ])),
    mobileComponent: {
      control: 'radio',
      options: ['regularList', 'mobileList'],
      description: 'List variant used at narrow container widths',
      table: { category },
    },
  }

  const controlNames = Object.keys(argTypes)

  return { argTypes, controlNames }
}
