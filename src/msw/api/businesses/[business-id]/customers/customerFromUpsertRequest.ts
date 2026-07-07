import { Schema } from 'effect'

import { type Customer, type UpsertCustomer, UpsertCustomerSchema } from '@schemas/customer'

import { readRequestJson } from '@msw/utils/request'

const decodeUpsertCustomer = Schema.decodeUnknownSync(UpsertCustomerSchema)

/*
 * Builds the response customer by echoing the upsert request body over `base`,
 * so the default mock returns what the client submitted instead of an
 * unrelated fixture (which would flash stale values into the SWR cache).
 * Fields absent from the body keep their `base` values.
 */
export const customerFromUpsertRequest = async (request: Request, base: Customer): Promise<Customer> => {
  const body = decodeUpsertCustomer(await readRequestJson(request))

  const definedFields = Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined),
  ) as Partial<UpsertCustomer>

  return { ...base, ...definedFields }
}
