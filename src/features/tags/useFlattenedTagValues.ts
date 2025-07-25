import { TagDimensionSchema } from './tagSchemas'
import { makeTagValue } from './components/TagSelector'
import { useMemo } from 'react'
import type { useTagDimensions } from './api/useTagDimensions'

function flattenDimensionsToValues(dimensions: ReadonlyArray<typeof TagDimensionSchema.Type>) {
  return dimensions.flatMap(({ id: dimensionId, key: dimensionLabel, definedValues }) =>
    definedValues.map(({ id: valueId, value: valueLabel }) => makeTagValue({
      dimensionId,
      dimensionLabel,
      valueId,
      valueLabel,
    })),
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
