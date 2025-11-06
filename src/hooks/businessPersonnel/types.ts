import type { EmailAddress, PhoneNumber } from '@internal-types/utility/branded'
import type { EnumWithUnknownValues } from '@internal-types/utility/enumWithUnknownValues'

type RawEmailAddressEntity = {
  id: string
  email_address: EmailAddress
}
type EmailAddressEntity = Pick<RawEmailAddressEntity, 'id'> & {
  emailAddress: EmailAddress
}

type RawPhoneNumberEntity = {
  id: string
  phone_number: PhoneNumber
}
type PhoneNumberEntity = Pick<RawPhoneNumberEntity, 'id'> & {
  phoneNumber: PhoneNumber
}

const PERSONNEL_ROLES = ['ACCOUNTANT', 'ADMINISTRATOR', 'OWNER'] as const
export type PersonnelRole = typeof PERSONNEL_ROLES[number]

export function isPersonnelRole(role: string): role is PersonnelRole {
  return PERSONNEL_ROLES.includes(role as PersonnelRole)
}

type RawPersonnelRoleEntity = {
  id: string
  role: EnumWithUnknownValues<PersonnelRole>
}
type PersonnelRoleEntity = Pick<RawPersonnelRoleEntity, 'id'> & {
  role: PersonnelRole
}

export type RawBusinessPersonnel = {
  id: string
  full_name: string
  preferred_name: string | null
  external_id: string | null
  email_addresses: ReadonlyArray<RawEmailAddressEntity>
  phone_numbers: ReadonlyArray<RawPhoneNumberEntity>
  roles: ReadonlyArray<RawPersonnelRoleEntity>
}
export type BusinessPersonnel = Pick<RawBusinessPersonnel, 'id'> & {
  fullName: RawBusinessPersonnel['full_name']
  preferredName: RawBusinessPersonnel['preferred_name']
  externalId: RawBusinessPersonnel['external_id']
  emailAddresses: ReadonlyArray<EmailAddressEntity>
  phoneNumbers: ReadonlyArray<PhoneNumberEntity>
  roles: ReadonlyArray<PersonnelRoleEntity>
}
