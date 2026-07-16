import type { CustomAccount } from '@schemas/customAccounts'

export type AccountOption = {
  value: string
  label: string
  account: Partial<CustomAccount> & Pick<CustomAccount, 'accountName'>
  __isNew__?: true
}
