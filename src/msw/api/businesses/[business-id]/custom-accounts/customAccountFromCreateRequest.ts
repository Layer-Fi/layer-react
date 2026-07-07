import { Schema } from 'effect'

import { type CustomAccount, CustomAccountSchema } from '@schemas/customAccounts'

import { readRequestJson } from '@msw/utils/request'

const CreateCustomAccountBodySchema = CustomAccountSchema.pick(
  'accountName',
  'accountType',
  'accountSubtype',
  'institutionName',
  'externalId',
  'mask',
  'userCreated',
)

const decodeCreateCustomAccount = Schema.decodeUnknownSync(CreateCustomAccountBodySchema)

/*
 * Builds the response account by echoing the create request body over `base`,
 * so the default mock returns what the client submitted instead of an
 * unrelated fixture (which would flash stale values into the SWR cache).
 */
export const customAccountFromCreateRequest = async (
  request: Request,
  base: CustomAccount,
): Promise<CustomAccount> => {
  const body = decodeCreateCustomAccount(await readRequestJson(request))

  return { ...base, ...body }
}
