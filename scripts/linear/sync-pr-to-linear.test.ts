import { describe, expect, it } from 'vitest'

import { buildMatchPrompt, categoryFromTitle, detectLinearIds, skipReason } from './sync-pr-to-linear.mjs'

describe('categoryFromTitle', () => {
  it('maps known prefixes to labels', () => {
    expect(categoryFromTitle('fix: trim externalId')).toBe('Bug')
    expect(categoryFromTitle('feat: scrollable modal')).toBe('Feature')
    expect(categoryFromTitle('refactor: use SWR mutation')).toBe('Improvement')
    expect(categoryFromTitle('chore: bump deps')).toBe('Improvement')
    expect(categoryFromTitle('i18n: align tax_estimates')).toBe('i18n')
    expect(categoryFromTitle('docs: update README')).toBe('Docs')
  })

  it('handles scopes and the breaking-change bang', () => {
    expect(categoryFromTitle('fix(line-items): blank check')).toBe('Bug')
    expect(categoryFromTitle('feat(ui)!: redesign')).toBe('Feature')
  })

  it('is case-insensitive on the prefix', () => {
    expect(categoryFromTitle('Fix: capitalized prefix')).toBe('Bug')
  })

  it('falls back to Uncategorized for unknown or absent prefixes', () => {
    expect(categoryFromTitle('update the confirm accounts modal')).toBe('Uncategorized')
    expect(categoryFromTitle('wip: experiment')).toBe('Uncategorized')
    expect(categoryFromTitle('')).toBe('Uncategorized')
    expect(categoryFromTitle(undefined as unknown as string)).toBe('Uncategorized')
  })
})

describe('detectLinearIds', () => {
  it('finds identifiers in title, branch, and body', () => {
    expect(detectLinearIds('fix: thing (ENG-123)')).toEqual(['ENG-123'])
    expect(detectLinearIds('swr/eng-1-x', 'Closes ENG-42 and ENG-43')).toEqual(['ENG-42', 'ENG-43'])
  })

  it('dedupes repeated identifiers', () => {
    expect(detectLinearIds('ENG-7', 'see ENG-7')).toEqual(['ENG-7'])
  })

  it('returns candidates that may be noise (caller verifies against Linear)', () => {
    // We accept false positives here; resolution against Linear rejects non-issues.
    expect(detectLinearIds('encode UTF-8 output')).toEqual(['UTF-8'])
  })

  it('returns nothing for text without identifiers', () => {
    expect(detectLinearIds('just a normal title')).toEqual([])
    expect(detectLinearIds('', undefined, null as unknown as string)).toEqual([])
  })
})

describe('buildMatchPrompt', () => {
  const ctx = { title: 'fix: trim externalId', headRef: 'swr/trim', body: 'Trims it.' }
  const candidates = [
    { identifier: 'ENG-1', title: 'API hardening', description: 'Ongoing schema cleanup' },
    { identifier: 'ENG-2', title: 'Perf', description: '' },
  ]

  it('includes the PR fields and every candidate with its index', () => {
    const prompt = buildMatchPrompt(ctx, candidates)
    expect(prompt).toContain('fix: trim externalId')
    expect(prompt).toContain('swr/trim')
    expect(prompt).toContain('0. [ENG-1] API hardening')
    expect(prompt).toContain('1. [ENG-2] Perf')
  })

  it('instructs the model to return -1 when uncertain', () => {
    expect(buildMatchPrompt(ctx, candidates)).toMatch(/-1.*own\s*\n?\s*issue/s)
  })
})

describe('skipReason', () => {
  it('skips unmerged closes', () => {
    expect(skipReason({ merged: false, headRef: 'feature/x' })).toBe('PR was closed without merging')
  })

  it('skips release-bump PRs', () => {
    expect(skipReason({ merged: true, headRef: 'release/v0.1.140' })).toMatch(/release-bump/)
  })

  it('does not skip a normal merged PR', () => {
    expect(skipReason({ merged: true, headRef: 'swr/some-feature' })).toBeNull()
  })
})
