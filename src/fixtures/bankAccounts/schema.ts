import { Arbitrary, Schema } from 'effect'

import {
  BalanceTimestampSchema,
  BankAccountSchema,
} from '@schemas/bankAccounts/bankAccount'
import { AccountInstitutionSchema } from '@schemas/common/accountInstitution'

import {
  accountNameKindArbitrary,
  amountArbitrary,
  balanceTimestampArbitrary,
  externalAccountsArbitrary,
  institutionArbitrary,
  isDisconnectedArbitrary,
  notificationsArbitrary,
} from '@fixtures/bankAccounts/arbitrary'
import { getAccountName } from '@fixtures/bankAccounts/constants'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/arbitrary/id'
import { maskArbitrary } from '@fixtures/utils/arbitrary/mask'
import { withArbitrary } from '@fixtures/utils/arbitrary/withArbitrary'

const fields = BankAccountSchema.fields

const base = Schema.Struct({
  ...fields,
  id: withArbitrary(fields.id, () => idArbitrary(FixtureIdPrefix.bankAccount)),
  accountName: Schema.String.annotations({
    arbitrary: () => accountNameKindArbitrary,
  }),
  institution: AccountInstitutionSchema.annotations({
    arbitrary: () => institutionArbitrary,
  }),
  notifyWhenDisconnected: withArbitrary(fields.notifyWhenDisconnected, () => fc =>
    fc.boolean()),
  isDisconnected: withArbitrary(fields.isDisconnected, () => isDisconnectedArbitrary),
  externalAccounts: withArbitrary(fields.externalAccounts, () => externalAccountsArbitrary),
  latestBalanceTimestamp: BalanceTimestampSchema.annotations({
    arbitrary: () => balanceTimestampArbitrary,
  }),
  currentLedgerBalance: withArbitrary(fields.currentLedgerBalance, () => amountArbitrary),
  mask: Schema.String.annotations({
    arbitrary: () => maskArbitrary,
  }),
  notifications: withArbitrary(fields.notifications, () => notificationsArbitrary),
})

const baseArbitrary = Arbitrary.make(base)

export const BankAccountArbitrarySchema = base.annotations({
  arbitrary: () => () =>
    baseArbitrary.map((bankAccount): typeof base.Type => {
      const institution = bankAccount.institution
      const mask = bankAccount.mask
      const accountName = getAccountName(institution, bankAccount.accountName)
      const isDisconnected = false

      return {
        ...bankAccount,
        accountName,
        isDisconnected,
        externalAccounts: bankAccount.externalAccounts.map(externalAccount => ({
          ...externalAccount,
          externalAccountName: accountName,
          mask,
          institution,
          notifications: [],
          connectionNeedsRepairAsOf: null,
          reconnectWithNewCredentials: false,
          isSyncing: false,
          userCreated: false,
        })),
        notifications: [],
      }
    }),
})

export const schema = BankAccountArbitrarySchema
