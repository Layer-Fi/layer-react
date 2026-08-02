import type { SWRMutationResult } from '@internal-types/swr/SWRResponseTypes'

export enum UpsertMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertProps<TShared extends object, TUpdateKeys extends object> =
  | ({ mode: UpsertMode.Create } & TShared)
  | ({ mode: UpsertMode.Update } & TShared & TUpdateKeys)

/**
 * Pairs a create mutation with its update mutation behind one mode-switched hook.
 *
 * Both hooks are always called, in a fixed order — the mode only decides which result is
 * returned. That is what keeps hook order stable when a form switches mode, and it is why the
 * update hook is handed a placeholder key in create mode: its key params are required, but
 * nothing triggers it, so no request is made.
 *
 * `toCreateOptions` / `toUpdateOptions` map the caller's props onto each hook's key params;
 * return `undefined` for a mutation that takes none.
 *
 * Passing a literal `mode` narrows the result to that mutation, so `trigger` takes exactly that
 * body type. Passing a value whose mode is not statically known widens `trigger` to accept
 * either body.
 */
export function createUpsertHook<
  TShared extends object,
  TUpdateKeys extends object,
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
  toCreateOptions: (props: UpsertProps<TShared, TUpdateKeys>) => TCreateOptions
  toUpdateOptions: (props: UpsertProps<TShared, TUpdateKeys>) => TUpdateOptions
}) {
  function useUpsert(props: { mode: UpsertMode.Create } & TShared): SWRMutationResult<TData, TCreateArg>
  function useUpsert(props: { mode: UpsertMode.Update } & TShared & TUpdateKeys): SWRMutationResult<TData, TUpdateArg>
  function useUpsert(props: UpsertProps<TShared, TUpdateKeys>): SWRMutationResult<TData, TCreateArg | TUpdateArg>
  /*
   * The overloads above are the contract. The implementation is deliberately loose: `trigger` is
   * contravariant in its argument, so with the type params still unresolved TS cannot prove one
   * concrete result satisfies all three signatures.
   */
  function useUpsert(props: UpsertProps<TShared, TUpdateKeys>) {
    const createResult = useCreate(toCreateOptions(props))
    const updateResult = useUpdate(toUpdateOptions(props))

    return (
      props.mode === UpsertMode.Create ? createResult : updateResult
    ) as SWRMutationResult<TData, TCreateArg> & SWRMutationResult<TData, TUpdateArg> & SWRMutationResult<TData, TCreateArg | TUpdateArg>
  }

  return useUpsert
}
