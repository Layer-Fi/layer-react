import { type FastCheck } from 'effect'

import { companyNames } from '@fixtures/constants/personal/companyNames'
import { individualNames } from '@fixtures/constants/personal/individualNames'
import { emailForName } from '@fixtures/utils/emailForName'

const nullableConstantFrom = (values: readonly string[]) => (fc: typeof FastCheck) =>
  fc.oneof(
    fc.constant(null),
    fc.constantFrom(...values),
  )

const GENERATED_EMAIL = 'GENERATE'

// Customers and vendors share this exact "contact" shape (same field names,
// same plausible-value generators) — one arbitrary per field, reused via
// `withArbitrary(fields.x, () => xArbitrary)` at each call site so the field
// types stay concrete instead of being erased through a generic wrapper.
export const externalIdArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    fc.constant(null),
    fc.integer({ min: 10000, max: 99999 }).map(n => `ext_${n}`),
  )

export const individualNameArbitrary = nullableConstantFrom(individualNames)
export const companyNameArbitrary = nullableConstantFrom(companyNames)

// Sampled as a sentinel here; `applyContactInvariants` replaces it with an
// email derived from the entity's own name/company once those are final.
export const generatedEmailArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    fc.constant(null),
    fc.constant(GENERATED_EMAIL),
  )

export const contactStatusArbitrary = (fc: typeof FastCheck) =>
  fc.constantFrom('ACTIVE', 'ARCHIVED')

export const memoArbitrary = (options: readonly string[]) => (fc: typeof FastCheck) =>
  fc.oneof(
    { arbitrary: fc.constant(null), weight: 4 },
    { arbitrary: fc.constantFrom(...options), weight: 1 },
  )

// A customer/vendor must have at least one of individualName/companyName set
// (mirrors validateCustomerForm's "either" rule), and its email — if
// present — is derived from its own name/company rather than sampled
// independently.
export const applyContactInvariants = <
  T extends { individualName: string | null, companyName: string | null, email: string | null },
>(entity: T): T => {
  const individualName = entity.individualName == null && entity.companyName == null
    ? 'Jane Doe'
    : entity.individualName

  const email = entity.email === GENERATED_EMAIL
    ? emailForName(individualName, entity.companyName)
    : entity.email

  return { ...entity, individualName, email }
}
