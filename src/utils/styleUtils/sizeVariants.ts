const SIZE_VARIANTS = ['sm', 'lg'] as const
type SizeVariant = (typeof SIZE_VARIANTS)[number]

export type Variants = Partial<{
  size: SizeVariant
}>
