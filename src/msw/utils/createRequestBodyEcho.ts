import { readRequestJson } from '@msw/utils/request'

export const createRequestBodyEcho = <TItem>(decode: (input: unknown) => Partial<TItem>) =>
  async (request: Request, base: TItem): Promise<TItem> => {
    const body = decode(await readRequestJson(request))
    const fields = Object.fromEntries(
      Object.entries(body).map(([key, value]) => [key, value === undefined ? null : value]),
    )

    return { ...base, ...fields }
  }
