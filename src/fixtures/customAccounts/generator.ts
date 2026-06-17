import {
  type CustomAccountSubtype,
  getCustomAccountTypeFromSubtype,
} from '@schemas/customAccounts'

import { schema } from '@fixtures/customAccounts/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'

const sample = createGenerator(schema)

/*
 * accountType is derived from accountSubtype so generated rows never pair values
 * the app wouldn't produce together (e.g. DEPOSITORY with CREDIT_CARD).
 */
export const generator: typeof sample = overrides =>
  sample(overrides).map(account => ({
    ...account,
    accountType: getCustomAccountTypeFromSubtype(
      account.accountSubtype as CustomAccountSubtype,
    ),
  }))
