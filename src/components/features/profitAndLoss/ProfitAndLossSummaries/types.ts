const _SIZE_VARIANTS = ['sm', 'lg'] as const
type SizeVariant = (typeof _SIZE_VARIANTS)[number]

export type Variants = Partial<{
  size: SizeVariant
}>
