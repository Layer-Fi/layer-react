type UnknownEnumValue = string & Record<never, never>

export type EnumWithUnknownValues<T extends string> = T | UnknownEnumValue
