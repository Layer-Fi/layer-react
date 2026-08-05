import { FIXTURE_YEAR } from '../../src/fixtures/constants/fixtureYear'

const RealDate = Date

// Clock ticks normally, but "now" is shifted to the last day of the fixture year.
const offset = new RealDate(FIXTURE_YEAR, 11, 31, 12, 0, 0).getTime() - RealDate.now()

// A Proxy rather than a subclass, so instances stay real Dates: with a subclass,
// `value instanceof Date` is false for dates built before this module ran (e.g. the
// fixture range constants), and query-param serialization silently falls back to
// `String(date)` instead of an ISO date.
globalThis.Date = new Proxy(RealDate, {
  construct: (target, args: ConstructorParameters<DateConstructor>) =>
    args.length === 0 ? new target(RealDate.now() + offset) : new target(...args),
  apply: () => new RealDate(RealDate.now() + offset).toString(),
  get: (target, property, receiver) => {
    if (property === 'now') return () => RealDate.now() + offset

    const value: unknown = Reflect.get(target, property, receiver)
    return value
  },
})
