import { describe, expect, it } from 'vitest'
// @ts-expect-error -- plain .mjs CI script, no type declarations
import { buildDescription, categoryFromTitle, findTeam, pickDoneState, skipReason } from './createPrIssue.mjs'

describe('categoryFromTitle', () => {
  it.each([
    ['fix: crash on empty ledger', 'Bug'],
    ['feat(ui): add month picker', 'Feature'],
    ['refactor!: drop legacy names', 'Improvement'],
    ['I18N: extract keys', 'i18n'],
    ['Bump deps', 'Uncategorized'],
    ['wibble: unknown prefix', 'Uncategorized'],
  ])('maps %j to %j', (title, expected) => {
    expect(categoryFromTitle(title)).toBe(expected)
  })

  it('falls back when the title is missing', () => {
    expect(categoryFromTitle(undefined)).toBe('Uncategorized')
  })
})

describe('skipReason', () => {
  it('processes a merged feature PR', () => {
    expect(skipReason({ merged: true, headRef: 'swr/some-work' })).toBeNull()
  })

  it('skips a PR closed without merging', () => {
    expect(skipReason({ merged: false, headRef: 'swr/some-work' })).toMatch(/without merging/)
  })

  it('skips release-bump PRs', () => {
    expect(skipReason({ merged: true, headRef: 'release/v1.2.3' })).toMatch(/release-bump/)
  })
})

describe('findTeam', () => {
  const teams = [
    { key: 'ENG', name: 'Engineering' },
    { key: 'FRA', name: 'FE Release Attribution' },
  ]

  it('matches by key, case-insensitively', () => {
    expect(findTeam(teams, 'fra')?.name).toBe('FE Release Attribution')
  })

  it('matches by name', () => {
    expect(findTeam(teams, 'FE Release Attribution')?.key).toBe('FRA')
  })

  it('returns null for an unknown team', () => {
    expect(findTeam(teams, 'Design')).toBeNull()
  })
})

describe('pickDoneState', () => {
  it('prefers a completed state literally named Done', () => {
    const states = [
      { id: 'a', name: 'Released', type: 'completed' },
      { id: 'b', name: 'Done', type: 'completed' },
    ]
    expect(pickDoneState(states)?.id).toBe('b')
  })

  it('accepts any completed state when none is named Done', () => {
    expect(pickDoneState([{ id: 'a', name: 'Shipped', type: 'completed' }])?.id).toBe('a')
  })

  it('returns null when the team has no completed state', () => {
    expect(pickDoneState([{ id: 'a', name: 'Todo', type: 'unstarted' }])).toBeNull()
  })
})

describe('buildDescription', () => {
  const pr = {
    url: 'https://github.com/Layer-Fi/layer-react/pull/42',
    author: 'sarahraines',
    mergedAt: '2026-08-19T12:00:00Z',
  }

  it('appends provenance below the PR body', () => {
    expect(buildDescription({ ...pr, body: 'Fixes the thing.\n' })).toBe(
      'Fixes the thing.\n\n---\n\nAuto-created from merged PR https://github.com/Layer-Fi/layer-react/pull/42\nAuthor: @sarahraines\nMerged: 2026-08-19T12:00:00Z',
    )
  })

  it('omits the separator when the PR has no body', () => {
    expect(buildDescription({ ...pr, body: '' })).not.toContain('---')
  })
})
