import { Schema } from 'effect'

import { createTransformedEnumSchema } from '@schemas/utils'

export enum Alignment {
  Left = 'LEFT',
  Right = 'RIGHT',
  Center = 'CENTER',
}

const AlignmentSchema = Schema.Enums(Alignment)

export const TransformedAlignmentSchema = createTransformedEnumSchema(
  AlignmentSchema,
  Alignment,
  Alignment.Left,
)

export enum Pinning {
  Left = 'LEFT',
  Right = 'RIGHT',
  Unpinned = 'UNPINNED',
}

const PinningSchema = Schema.Enums(Pinning)

export const TransformedPinningSchema = createTransformedEnumSchema(
  PinningSchema,
  Pinning,
  Pinning.Unpinned,
)
