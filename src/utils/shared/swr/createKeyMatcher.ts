import { unstable_serialize } from 'swr'

type ParamConfig<TParams> = Array<{
  key: keyof TParams & string
  compare?: (a: unknown, b: unknown) => boolean
}>

function serializedKeyMatchesParams<TParams extends Record<string, unknown>>(
  serializedKey: string,
  params: TParams,
  paramConfig: ParamConfig<TParams>,
): boolean {
  return paramConfig.every(({ key }) => {
    const value = params[key]

    if (value === undefined) {
      // If our value is undefined, the key should not exist in serializedKey
      return !serializedKey.includes(`${key}:`)
    }

    const serialized = unstable_serialize({ [key]: value })

    // Remove first and last chars: "#key:value," -> "key:value"
    const keyValuePair = serialized.slice(1, -1)
    return serializedKey.includes(keyValuePair)
  })
}

function objectKeyMatchesParams<TParams extends Record<string, unknown>>(
  key: Record<string, unknown>,
  params: TParams,
  paramConfig: ParamConfig<TParams>,
): boolean {
  return paramConfig.every(({ key: paramKey, compare }) => {
    const keyValue = key[paramKey]
    const paramValue = params[paramKey]

    if (compare) {
      return compare(keyValue, paramValue)
    }

    return keyValue === paramValue
  })
}

export function createKeyMatcher<
  TKey extends Record<string, unknown>,
  TParams extends Record<string, unknown>,
>(paramConfig: ParamConfig<TParams>) {
  return function keyMatchesParams(
    key: TKey | string,
    params: TParams,
  ): boolean {
    return typeof key === 'string'
      ? serializedKeyMatchesParams(key, params, paramConfig)
      : objectKeyMatchesParams(key, params, paramConfig)
  }
}
