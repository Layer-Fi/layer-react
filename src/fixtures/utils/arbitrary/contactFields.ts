import { type FastCheck } from 'effect'

import { companyNames } from '@fixtures/constants/personal/companyNames'
import { individualNames } from '@fixtures/constants/personal/individualNames'
import { nullable } from '@fixtures/utils/arbitrary/nullable'
import { nullableConstantFrom } from '@fixtures/utils/arbitrary/nullableConstantFrom'

const GENERATED_EMAIL = 'GENERATE'

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')

const emailForName = (individualName: string | null | undefined, companyName: string | null | undefined) => {
  const local = individualName != null ? slugify(individualName) : 'contact'
  const domain = companyName != null ? `${slugify(companyName).replace(/\./g, '')}.test` : 'example.com'

  return `${local}@${domain}`
}

export const individualNameArbitrary = nullableConstantFrom(individualNames)
export const companyNameArbitrary = nullableConstantFrom(companyNames)

export const generatedEmailArbitrary = nullableConstantFrom([GENERATED_EMAIL])

const phoneNumberValueArbitrary = (fc: typeof FastCheck) =>
  fc.tuple(
    fc.integer({ min: 200, max: 999 }),
    fc.integer({ min: 0, max: 99 }),
  ).map(([areaCode, line]) => `+1${areaCode}55501${String(line).padStart(2, '0')}`)

export const phoneNumberArbitrary = nullable(phoneNumberValueArbitrary)

export const contactStatusArbitrary = (fc: typeof FastCheck) =>
  fc.constantFrom('ACTIVE', 'ARCHIVED')

export const memoArbitrary = (options: readonly string[]) =>
  nullableConstantFrom(options, { nullWeight: 4, valueWeight: 1 })

export const applyContactInvariants = <
  T extends { individualName: string | null | undefined, companyName: string | null | undefined, email: string | null | undefined },
>(entity: T): T => {
  const individualName = entity.individualName == null && entity.companyName == null
    ? 'Jane Doe'
    : entity.individualName

  const email = entity.email === GENERATED_EMAIL
    ? emailForName(individualName, entity.companyName)
    : entity.email

  return { ...entity, individualName, email }
}
