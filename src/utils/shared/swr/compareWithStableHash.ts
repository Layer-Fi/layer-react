/**
 * https://github.com/shuding/stable-hash/blob/main/src/index.ts
 *
 * This stable hash algorithm is (mostly) the default that is used by SWR.
 * We added special consideration for BigDecimal values to compare them by
 * using the BigDecimal.toString() method under the hood rather than going
 * through the default object handling which accesses every key, creating
 * an infinitely deeply nested BigDecimal (because BigDecimal.normalized
 * is also a BigDecimal, and accessing this key instantiates it).
 */

/* eslint-disable @typescript-eslint/no-explicit-any,
                  @typescript-eslint/no-unsafe-argument,
                  @typescript-eslint/no-unsafe-assignment,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-return */

import { BigDecimal as BD } from 'effect'

// Use WeakMap to store the object-key mapping so the objects can still be
// garbage collected. WeakMap uses a hashtable under the hood, so the lookup
// complexity is almost O(1).
const table = new WeakMap<object, string>()

// A counter of the key.
let counter = 0

// A stable hash implementation that supports:
//  - Fast and ensures unique hash properties
//  - Handles unserializable values
//  - Handles object key ordering
//  - Generates short results
//
// This is not a serialization function, and the result is not guaranteed to be
// parsable.
function stableHash(arg: any): string {
  const type = typeof arg
  const constructor = arg && arg.constructor
  const isDate = constructor === Date

  /** BEGIN ADDED BY LAYERFI */
  const isBigDecimal = BD.isBigDecimal(arg)
  if (isBigDecimal) return arg.toString()
  /** END ADDED BY LAYERFI */

  if (Object(arg) === arg && !isDate && !isBigDecimal && constructor != RegExp) {
    // Object/function, not null/date/regexp. Use WeakMap to store the id first.
    // If it's already hashed, directly return the result.
    let result = table.get(arg)
    if (result) return result
    // Store the hash first for circular reference detection before entering the
    // recursive `stableHash` calls.
    // For other objects like set and map, we use this id directly as the hash.
    result = ++counter + '~'
    table.set(arg, result)
    let index: any

    if (constructor === Array) {
      // Array.
      result = '@'
      for (index = 0; index < arg.length; index++) {
        result += stableHash(arg[index]) + ','
      }
      table.set(arg, result)
    }
    else if (constructor === Object) {
      // Object, sort keys.
      result = '#'
      const keys = Object.keys(arg).sort()
      while ((index = keys.pop() as string) !== undefined) {
        if (arg[index] !== undefined) {
          result += index + ':' + stableHash(arg[index]) + ','
        }
      }
      table.set(arg, result)
    }
    return result
  }

  if (isDate) return arg.toJSON()
  if (type === 'symbol') return arg.toString()
  return type === 'string' ? JSON.stringify(arg) : '' + arg
}

export const compareWithStableHash = (a?: unknown, b?: unknown) => stableHash(a) === stableHash(b)
