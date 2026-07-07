import { Schema } from 'effect'

import { type CustomAccount, CustomAccountSchema } from '@schemas/customAccounts'

import { createUpsertRequestEcho } from '@msw/utils/createEchoResolvers'

const CreateCustomAccountBodySchema = CustomAccountSchema.pick(
  'accountName',
  'accountType',
  'accountSubtype',
  'institutionName',
  'externalId',
  'mask',
  'userCreated',
)

export const customAccountFromCreateRequest = createUpsertRequestEcho<CustomAccount>(
  Schema.decodeUnknownSync(CreateCustomAccountBodySchema),
)
