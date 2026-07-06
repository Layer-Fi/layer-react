import { type FastCheck } from 'effect'

import { companyNames } from '@fixtures/constants/personal/companyNames'
import { individualNames } from '@fixtures/constants/personal/individualNames'

const nullableConstantFrom = (values: readonly string[]) => (fc: typeof FastCheck) =>
  fc.oneof(
    fc.constant(null),
    fc.constantFrom(...values),
  )

const GENERATED_EMAIL = 'GENERATE'

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')

const emailForName = (individualName: string | null, companyName: string | null) => {
  const local = individualName != null ? slugify(individualName) : 'contact'
  const domain = companyName != null ? `${slugify(companyName).replace(/\./g, '')}.test` : 'example.com'

  return `${local}@${domain}`
}

export const externalIdArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    fc.constant(null),
    fc.integer({ min: 10000, max: 99999 }).map(n => `ext_${n}`),
  )

export const individualNameArbitrary = nullableConstantFrom(individualNames)
export const companyNameArbitrary = nullableConstantFrom(companyNames)

export const generatedEmailArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    fc.constant(null),
    fc.constant(GENERATED_EMAIL),
  )

export const phoneNumberArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    fc.constant(null),
    fc.tuple(
      fc.integer({ min: 200, max: 999 }),
      fc.integer({ min: 0, max: 99 }),
    ).map(([areaCode, line]) => `+1${areaCode}55501${String(line).padStart(2, '0')}`),
  )

export const contactStatusArbitrary = (fc: typeof FastCheck) =>
  fc.constantFrom('ACTIVE', 'ARCHIVED')

export const memoArbitrary = (options: readonly string[]) => (fc: typeof FastCheck) =>
  fc.oneof(
    { arbitrary: fc.constant(null), weight: 4 },
    { arbitrary: fc.constantFrom(...options), weight: 1 },
  )

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
