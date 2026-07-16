import { Schema } from 'effect'

import { type CustomAccount, CustomAccountSchema } from '@schemas/customAccounts'

import { createRequestBodyEcho } from '@msw/utils/createRequestBodyEcho'

const CreateCustomAccountBodySchema = CustomAccountSchema.pick(
  'accountName',
  'accountType',
  'accountSubtype',
  'customAccountType',
  'institutionName',
  'externalId',
  'mask',
  'userCreated',
)

export const customAccountFromCreateRequest = createRequestBodyEcho<CustomAccount>(
  Schema.decodeUnknownSync(CreateCustomAccountBodySchema),
)
