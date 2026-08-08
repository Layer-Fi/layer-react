import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { BREAKPOINTS } from '@utils/shared/size/screenSizeBreakpoints'

const BREAKPOINTS_SCSS = readFileSync(join(__dirname, '_breakpoints.scss'), 'utf8')

const readScssPx = (name: string) => {
  const match = new RegExp(`^\\$${name}:\\s*(\\d+)px;$`, 'm').exec(BREAKPOINTS_SCSS)

  expect(match, `$${name} is not declared in _breakpoints.scss`).not.toBeNull()

  return Number(match![1])
}

describe('_breakpoints.scss', () => {
  it('mirrors the TypeScript size-class thresholds', () => {
    expect(readScssPx('mobile')).toBe(BREAKPOINTS.MOBILE)
    expect(readScssPx('tablet')).toBe(BREAKPOINTS.TABLET)
  })
})
