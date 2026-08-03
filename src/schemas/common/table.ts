import { Schema } from 'effect'

import { Alignment, Pinning } from '@internal-types/utility/table'
import { createTransformedEnumSchema } from '@schemas/utils'

const AlignmentSchema = Schema.Enums(Alignment)

export const TransformedAlignmentSchema = createTransformedEnumSchema(
  AlignmentSchema,
  Alignment,
  Alignment.Left,
)

const PinningSchema = Schema.Enums(Pinning)

export const TransformedPinningSchema = createTransformedEnumSchema(
  PinningSchema,
  Pinning,
  Pinning.Unpinned,
)
