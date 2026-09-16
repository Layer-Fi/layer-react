import type { SWRMutationResult } from '@hooks/utils/swr/SWRResponseTypes'

export enum UpsertMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertProps<TCreateProps extends object, TUpdateProps extends object> =
  | ({ mode: UpsertMode.Create } & TCreateProps)
  | ({ mode: UpsertMode.Update } & TUpdateProps)

/*
 * In create mode the props carry no update keys, so `toUpdateOptions` reads them as undefined
 * even though its parameter type says otherwise. The update hook still needs a key to build its
 * SWR key, and nothing triggers it, so an empty string stands in.
 */
const withPlaceholderKeys = <TOptions>(options: TOptions): TOptions => {
  if (options === null || typeof options !== 'object') return options

  return Object.fromEntries(
    Object.entries(options).map(([key, value]) => [key, value ?? '']),
  ) as TOptions
}

/**
 * Pairs a create mutation with its update mutation behind one mode-switched hook.
 *
 * Both hooks are always called, in a fixed order — the mode only decides which result is
 * returned. That is what keeps hook order stable when a form switches mode, and it is why the
 * update hook is handed a placeholder key in create mode: its key params are required, but
 * nothing triggers it, so no request is made.
 *
 * Each mapper declares the props its own mode accepts, and that is what the caller must pass:
 * `toUpdateOptions: (props: { vehicleId: string })` makes `vehicleId` required under
 * `mode: Update` and absent under `mode: Create`. Params both modes need are declared in both
 * mappers. Return `undefined` for a mutation that takes no key params.
 *
 * Passing a literal `mode` narrows the result to that mutation, so `trigger` takes exactly that
 * body type. Passing a value whose mode is not statically known widens `trigger` to accept
 * either body.
 */
export function createUpsertHook<
  TCreateProps extends object,
  TUpdateProps extends object,
  TCreateOptions,
  TUpdateOptions,
  TData,
  TCreateArg,
  TUpdateArg,
>({
  useCreate,
  useUpdate,
  toCreateOptions,
  toUpdateOptions,
}: {
  useCreate: (options: TCreateOptions) => SWRMutationResult<TData, TCreateArg>
  useUpdate: (options: TUpdateOptions) => SWRMutationResult<TData, TUpdateArg>
  toCreateOptions: (props: TCreateProps) => TCreateOptions
  toUpdateOptions: (props: TUpdateProps) => TUpdateOptions
}) {
  function useUpsert(props: { mode: UpsertMode.Create } & TCreateProps): SWRMutationResult<TData, TCreateArg>
  function useUpsert(props: { mode: UpsertMode.Update } & TUpdateProps): SWRMutationResult<TData, TUpdateArg>
  function useUpsert(props: UpsertProps<TCreateProps, TUpdateProps>): SWRMutationResult<TData, TCreateArg | TUpdateArg>
  /*
   * The overloads above are the contract. The implementation is deliberately loose: `trigger` is
   * contravariant in its argument, so with the type params still unresolved TS cannot prove one
   * concrete result satisfies all three signatures.
   */
  function useUpsert(props: UpsertProps<TCreateProps, TUpdateProps>) {
    const createResult = useCreate(toCreateOptions(props as TCreateProps))
    const updateResult = useUpdate(withPlaceholderKeys(toUpdateOptions(props as TUpdateProps)))

    return (
      props.mode === UpsertMode.Create ? createResult : updateResult
    ) as SWRMutationResult<TData, TCreateArg> & SWRMutationResult<TData, TUpdateArg> & SWRMutationResult<TData, TCreateArg | TUpdateArg>
  }

  return useUpsert
}
