import { Money } from './Money'

describe(Money.format, () => {
  it('turns cents into dollar strings', () => {
    const out = Money.format({ amount: 123450 })

    expect(out).toEqual('-$1,234.50')
  })

  it('turns cents into dollar strings precisely', () => {
    const out = Money.format({ amount: (0.1 + 0.2) * 100 })

    expect(out).toEqual('-$0.30')
  })

  it('turns CREDITs into plusses', () => {
    const out = Money.format({ amount: 1234, direction: 'CREDIT' })

    expect(out).toEqual('+$12.34')
  })
})
