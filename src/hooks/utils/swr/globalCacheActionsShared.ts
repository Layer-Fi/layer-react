import { type CacheKeyInfo } from '@utils/swr/withSWRKeyTags'

export type InvalidateOptions = { withPrecedingOptimisticUpdate?: boolean }
export type PatchOptions = { withRevalidate: boolean }

export const createTagPredicate = (tagKey: string) => ({ tags }: CacheKeyInfo) => tags.includes(tagKey)
