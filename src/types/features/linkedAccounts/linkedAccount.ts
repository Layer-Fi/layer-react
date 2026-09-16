import type { PlaidInstitution } from 'react-plaid-link'

import type { EnumWithUnknownValues } from '@internal-types/utility/enumWithUnknownValues'

export type PublicToken = {
  public_token: string
  institution: PlaidInstitution | null
}

export type AccountSource = EnumWithUnknownValues<'PLAID' | 'STRIPE'>
