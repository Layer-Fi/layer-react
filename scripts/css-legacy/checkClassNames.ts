/* eslint-disable no-console */
import { checkRemovedClassNames } from './checkRemovedClassNames'
import { checkUnusedLegacyKeys } from './checkUnusedLegacyKeys'

/**
 * Every class-name check, in one job. They catch opposite failures — an entry that emits nothing,
 * and a name that left the source — so neither result implies the other.
 *
 * Both run before the exit code is decided, so one failure never hides the other.
 */
const results = [checkUnusedLegacyKeys(), checkRemovedClassNames()]

if (results.includes(false)) process.exit(1)
