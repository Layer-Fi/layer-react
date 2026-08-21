import { describe, expect, it } from 'vitest'
import { bumpVersion, nextReleaseVersion } from './nextVersion.mjs'

describe('nextReleaseVersion', () => {
  it.each([
    ['0.1.144', 'patch', '0.1.145-alpha.0'],
    ['0.1.144', 'minor', '0.2.0-alpha.0'],
    ['0.1.144', 'major', '1.0.0-alpha.0'],
  ])('starts a cycle from stable %s (%s)', (current, increment, expected) => {
    expect(nextReleaseVersion(current, 'alpha', increment)).toBe(expected)
  })

  it.each(['patch', 'minor', 'major'])('increments an in-progress alpha, ignoring %s', (increment) => {
    expect(nextReleaseVersion('0.1.145-alpha.0', 'alpha', increment)).toBe('0.1.145-alpha.1')
  })

  it.each(['patch', 'minor', 'major'])('finalizes an alpha by dropping the suffix, ignoring %s', (increment) => {
    expect(nextReleaseVersion('0.1.145-alpha.2', 'stable', increment)).toBe('0.1.145')
  })

  it.each([
    ['patch', '0.1.146'],
    ['minor', '0.2.0'],
    ['major', '1.0.0'],
  ])('ships straight from stable (%s)', (increment, expected) => {
    expect(nextReleaseVersion('0.1.145', 'stable', increment)).toBe(expected)
  })

  it.each(['0.1', 'v0.1.145', '0.1.145-beta.0', ''])('rejects %s', (current) => {
    expect(() => nextReleaseVersion(current, 'alpha', 'patch')).toThrow(/Unsupported version/)
  })

  it('rejects an unknown release type', () => {
    expect(() => nextReleaseVersion('0.1.145', 'beta', 'patch')).toThrow(/Unsupported release type/)
  })

  it('rejects an unknown increment', () => {
    expect(() => nextReleaseVersion('0.1.145', 'stable', 'huge')).toThrow(/Unsupported increment/)
  })
})

describe('bumpVersion', () => {
  it('bumps from the base of a prerelease', () => {
    expect(bumpVersion('0.1.145-alpha.3', 'patch')).toBe('0.1.146')
  })
})
