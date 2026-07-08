import { Arbitrary, type FastCheck, Schema } from 'effect'

import {
  BalanceTimestampSchema,
  BankAccountSchema,
} from '@schemas/bankAccounts/bankAccount'
import { AccountInstitutionSchema } from '@schemas/common/accountInstitution'

import { accountNameKinds, getAccountName, institutions } from '@fixtures/bankAccounts/constants'
import { externalAccountConnectionSchema } from '@fixtures/bankAccounts/externalAccountConnectionSchema'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/idArbitrary'
import { withArbitrary } from '@fixtures/utils/withArbitrary'

const maskArbitrary = (fc: typeof FastCheck) =>
  fc.integer({ min: 0, max: 9999 }).map(n => String(n).padStart(4, '0'))

const amountArbitrary = (fc: typeof FastCheck) =>
  fc.integer({ min: 50000, max: 2500000 })

const institutionArbitrary = (fc: typeof FastCheck) =>
  fc.constantFrom(...institutions)

const fields = BankAccountSchema.fields

const base = Schema.Struct({
  ...fields,
  id: withArbitrary(fields.id, () => idArbitrary(FixtureIdPrefix.bankAccount)),
  accountName: Schema.String.annotations({
    arbitrary: () => fc => fc.constantFrom(...accountNameKinds),
  }),
  institution: AccountInstitutionSchema.annotations({
    arbitrary: () => institutionArbitrary,
  }),
  notifyWhenDisconnected: withArbitrary(fields.notifyWhenDisconnected, () => fc =>
    fc.boolean()),
  isDisconnected: withArbitrary(fields.isDisconnected, () => fc =>
    fc.oneof(
      { arbitrary: fc.constant(false), weight: 4 },
      { arbitrary: fc.constant(true), weight: 1 },
    )),
  externalAccounts: withArbitrary(fields.externalAccounts, () => fc =>
    fc.array(Arbitrary.make(externalAccountConnectionSchema), { minLength: 1, maxLength: 2 })),
  latestBalanceTimestamp: BalanceTimestampSchema.annotations({
    arbitrary: () => fc => amountArbitrary(fc).map(balance => ({ balance })),
  }),
  currentLedgerBalance: withArbitrary(fields.currentLedgerBalance, () => amountArbitrary),
  mask: Schema.String.annotations({
    arbitrary: () => maskArbitrary,
  }),
  notifications: withArbitrary(fields.notifications, () => fc =>
    fc.oneof(
      { arbitrary: fc.constant([]), weight: 4 },
      { arbitrary: fc.constant([{ type: 'ACCOUNT_DISCONNECTED' }]), weight: 1 },
    )),
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
