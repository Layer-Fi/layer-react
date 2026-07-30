import { FIXTURE_YEAR } from '../../src/fixtures/constants/fixtureYear'

export const installMockedSystemDate = () => {
  const RealDate = Date

  // Clock ticks normally, but "now" is shifted to the last day of the fixture year.
  const offset = new RealDate(FIXTURE_YEAR, 11, 31, 12, 0, 0).getTime() - RealDate.now()

  class MockedDate extends RealDate {
    constructor(...args: unknown[]) {
      if (args.length === 0) {
        super(RealDate.now() + offset)
      }
      else {
        super(...args as ConstructorParameters<DateConstructor>)
      }
    }

    static now() {
      return RealDate.now() + offset
    }
  }

  globalThis.Date = MockedDate as DateConstructor
}
