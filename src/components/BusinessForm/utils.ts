import { BaseSelectOption } from '../../types/general'

export const findSelectOption = (options: BaseSelectOption[], value?: string) => {
  if (!value) {
    return undefined
  }

  return options.find(o => (o.value as string).toLowerCase() === value.toLowerCase())
}
