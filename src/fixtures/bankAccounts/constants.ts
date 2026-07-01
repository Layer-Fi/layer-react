import { type AccountInstitution } from '@schemas/common/accountInstitution'

export const accountNameKinds = [
  'Business Checking',
  'Business Savings',
  'Business Credit Card',
] as const

export const institutions: AccountInstitution[] = [
  { name: 'Chase', logo: null },
  { name: 'Bank of America', logo: null },
  { name: 'Wells Fargo', logo: null },
  { name: 'Capital One', logo: null },
  { name: 'American Express', logo: null },
]

export const getAccountName = (institution: AccountInstitution, accountNameKind: string) =>
  `${institution.name} ${accountNameKind}`
