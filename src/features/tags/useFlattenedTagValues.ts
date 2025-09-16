import { makeTagValue, TagDimensionSchema } from './tagSchemas'
import { useMemo } from 'react'
import type { useTagDimensions } from './api/useTagDimensions'

/**
 * Converts 'san-francisco' to 'San Francisco' or 'something_like_this' to 'Something Like This'
 * @param input - The input string to convert to capital case.
 * @returns The input string in capital case.
 */
export function barbequeToCapitalCase(input: string) {
  return input.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
}

function flattenDimensionsToValues(dimensions: ReadonlyArray<typeof TagDimensionSchema.Type>) {
  return dimensions.flatMap(({ id: dimensionId, key: dimensionLabel, definedValues, displayName: dimensionDisplayName }) => {
    const values = definedValues.map(({ id: valueId, value: valueLabel, displayName: valueDisplayName, archivedAt }) => makeTagValue({
      dimensionId,
      dimensionLabel: dimensionDisplayName ?? dimensionLabel,
      valueId,
      valueLabel: archivedAt !== null ? `${valueDisplayName ?? valueLabel} (Archived)` : (valueDisplayName ?? valueLabel),
    }))

    return values
  },
  )
}

export function useFlattenedTagValues(dimensions: ReturnType<typeof useTagDimensions>['data']) {
  return useMemo(() => {
    if (dimensions === undefined) {
      return []
    }

    return flattenDimensionsToValues(dimensions)
  }, [dimensions])
}
