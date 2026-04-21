declare namespace Intl {
  interface DurationFormatOptions {
    localeMatcher?: 'best fit' | 'lookup'
    style?: 'long' | 'short' | 'narrow' | 'digital'
  }

  interface DurationInput {
    years?: number
    months?: number
    weeks?: number
    days?: number
    hours?: number
    minutes?: number
    seconds?: number
    milliseconds?: number
    microseconds?: number
    nanoseconds?: number
  }

  class DurationFormat {
    constructor(locales?: string | string[], options?: DurationFormatOptions)
    format(duration: DurationInput): string
  }
}

declare module '@formatjs/intl-durationformat' {
  export type DurationInput = Intl.DurationInput
  export type DurationFormatOptions = Intl.DurationFormatOptions

  export class DurationFormat {
    constructor(locales?: string | string[], options?: DurationFormatOptions)
    format(duration: DurationInput): string
  }
}
