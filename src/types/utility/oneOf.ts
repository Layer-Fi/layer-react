type OnlyFirst<First, Second> = First & { [Key in keyof Omit<Second, keyof First>]: never }

type MergeTypes<Types extends Array<unknown>, Result = Record<never, never>> =
  Types extends [infer Head, ...infer Remaining]
    ? MergeTypes<Remaining, Result & Head>
    : Result

export type OneOf<
  Types extends Array<unknown>,
  Result = never,
  AllProperties = MergeTypes<Types>,
> = Types extends [infer Head, ...infer Remaining]
  ? OneOf<Remaining, Result | OnlyFirst<Head, AllProperties>, AllProperties>
  : Result
