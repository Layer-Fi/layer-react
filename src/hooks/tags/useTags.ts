import { useTagsStore } from '../../contexts/Tags/TagsStoreProvider'
import useSWR from 'swr'

type TagKey = string
type TagOptionValue = string
type TagCategoryOption = { label: string; value: TagOptionValue }

type RemoteTag = {
  label: string
  value: TagKey
  categories: Array<TagCategoryOption>
}

const PROJECT_TAG: RemoteTag = {
  label: 'Projects',
  value: 'project',
  categories: [
    {
      label: 'Project A',
      value: 'project-a',
    },
    {
      label: 'Project B',
      value: 'project-b',
    },
    {
      label: 'Project C',
      value: 'project-c',
    },
  ],
}

export function useTags() {
  const {
    activeKey: storeActiveKey,
    activeCategory: storeActiveCategory,
    actions: { setActiveCategory },
  } = useTagsStore()

  const { data } = useSWR('tags', () => [PROJECT_TAG])

  if (data === undefined) {
    return {
      tag: undefined,
      category: undefined,
      categoryOptions: [],
      setActiveCategory,
    } as const
  }

  const activeTagEntry = data.find(({ value }) => value === storeActiveKey)
  const categoryOptions = activeTagEntry?.categories ?? []
  const activeCategoryEntry = categoryOptions.find(
    ({ value }) => value === storeActiveCategory,
  )

  return {
    tag: activeTagEntry,
    category: activeCategoryEntry,
    categoryOptions,
    setActiveCategory,
  } as const
}
