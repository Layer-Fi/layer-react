import type { CustomAccount } from '@schemas/features/customAccounts/customAccount'

export type AccountOption = {
  value: string
  label: string
  account: Partial<CustomAccount> & Pick<CustomAccount, 'accountName'>
  __isNew__?: true
}
