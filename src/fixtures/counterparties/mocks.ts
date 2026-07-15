import { type BankTransactionCounterparty } from '@schemas/bankTransactions/base'

// Names overlap counterpartyName values in the generated bank transaction
// fixtures so counterparty pickers line up with transaction data.
export const counterparties: BankTransactionCounterparty[] = [
  {
    id: '00000000-0000-4000-8000-000000000501',
    externalId: 'cp_amazon',
    name: 'Amazon',
    website: 'https://www.amazon.com',
    logo: null,
    mccs: ['5942'],
  },
  {
    id: '00000000-0000-4000-8000-000000000502',
    externalId: 'cp_shopify',
    name: 'Shopify',
    website: 'https://www.shopify.com',
    logo: null,
    mccs: ['5734'],
  },
  {
    id: '00000000-0000-4000-8000-000000000503',
    externalId: 'cp_paypal',
    name: 'PayPal',
    website: 'https://www.paypal.com',
    logo: null,
    mccs: ['6012'],
  },
  {
    id: '00000000-0000-4000-8000-000000000504',
    externalId: 'cp_stripe',
    name: 'Stripe',
    website: 'https://www.stripe.com',
    logo: null,
    mccs: ['6012'],
  },
  {
    id: '00000000-0000-4000-8000-000000000505',
    externalId: 'cp_delta',
    name: 'Delta Air Lines',
    website: 'https://www.delta.com',
    logo: null,
    mccs: ['3058'],
  },
  {
    id: '00000000-0000-4000-8000-000000000506',
    externalId: 'cp_wework',
    name: 'WeWork',
    website: 'https://www.wework.com',
    logo: null,
    mccs: ['6513'],
  },
]
