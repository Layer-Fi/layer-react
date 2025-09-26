import { useMemo } from 'react'
import { useTagDimensions } from './useTagDimensions'
import { type TagDimension } from '../tagSchemas'

export type AvailableTagDimensionsResult = {
  availableDimensions: TagDimension[]
  unavailableDimensionKeys: string[]
  isLoading: boolean
  isError: boolean
  isValidating: boolean
}

type UseAvailableTagDimensionsParams = {
  desiredDimensionKeys?: string[]
  isEnabled?: boolean
}

export function useAvailableTagDimensions({
  desiredDimensionKeys = [],
  isEnabled = true,
}: UseAvailableTagDimensionsParams = {}): AvailableTagDimensionsResult {
  const { data: allDimensions, isLoading, isError, isValidating } = useTagDimensions({ isEnabled })

  const result = useMemo(() => {
    if (!allDimensions) {
      return {
        availableDimensions: [],
        unavailableDimensionKeys: desiredDimensionKeys,
        isLoading,
        isError,
        isValidating,
      }
    }

    const availableDimensionsMap = new Map<string, TagDimension>()
    allDimensions.forEach((dimension) => {
      availableDimensionsMap.set(dimension.key, dimension)
    })

    const availableDimensions: TagDimension[] = []
    const unavailableDimensionKeys: string[] = []

    desiredDimensionKeys.forEach((desiredKey) => {
      const dimension = availableDimensionsMap.get(desiredKey)

      if (dimension && dimension.definedValues.length > 0) {
        availableDimensions.push(dimension)
      }
      else {
        unavailableDimensionKeys.push(desiredKey)
      }
    })

    return {
      availableDimensions,
      unavailableDimensionKeys,
      isLoading,
      isError,
      isValidating,
    }
  }, [allDimensions, desiredDimensionKeys, isLoading, isError, isValidating])

  return result
}
