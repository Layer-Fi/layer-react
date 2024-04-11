import { Direction } from '../../types'
import { BaseSelectOption } from '../../types/general'

export const SUB_TYPE_OPTIONS: BaseSelectOption[] = [
  {
    value: Direction.DEBIT,
    label: 'Debit',
  },
  {
    value: Direction.CREDIT,
    label: 'Credit',
  },
]
