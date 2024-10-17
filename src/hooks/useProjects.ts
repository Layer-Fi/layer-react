import { useCallback, useState } from 'react'

type TagKey = string
type TagOptionValue = string
type TagCategoryOption = { label: string; value: TagOptionValue }

type TagState = Record<
  TagKey,
  {
    label: string
    key: TagKey
    isActive: boolean
    activeValue?: TagCategoryOption
    valueOptions: Array<TagCategoryOption>
  }
>

// We should tweak this for the demo
const DEFAULT_TAG_STATE: TagState = {
  project: {
    label: 'Projects',
    key: 'project',
    isActive: true,
    activeValue: undefined,
    valueOptions: [
      {
        label: 'Project A',
        value: 'project-a',
      },
      {
        label: 'Project B',
        value: 'project-b',
      },
      // {
      //   label: 'Special Secret Project',
      //   value: 'project-3',
      // },
    ],
  },
}

export function useTags() {
  const [state, setTagState] = useState(DEFAULT_TAG_STATE)

  const activeTag = Object.values(state).find(({ isActive }) => isActive)

  const setActiveValue = useCallback(
    ({ key, activeValue }: { key: TagKey; activeValue?: TagOptionValue }) => {
      console.log('setting active value', key, activeValue)
      setTagState(currentState => {
        const tag = currentState[key]

        if (!tag) {
          console.warn('Tag category not found for key:', key)
          return currentState
        }

        return {
          ...currentState,
          [key]: {
            ...tag,
            activeValue: tag.valueOptions.find(
              ({ value }) => value === activeValue,
            ),
          },
        }
      })
    },
    [setTagState],
  )

  if (activeTag === undefined) {
    return {
      hasActiveTag: false,
      tagLabel: undefined,
      tagKey: undefined,
      activeValue: undefined,
      valueOptions: undefined,
      setActiveValue,
    } as const
  }

  const { label: tagLabel, key: tagKey, activeValue, valueOptions } = activeTag
  console.log('internal state', activeValue)

  return {
    hasActiveTag: true,
    tagLabel,
    tagKey,
    activeValue,
    valueOptions,
    setActiveValue,
  } as const
}
