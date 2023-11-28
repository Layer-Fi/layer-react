import React from 'react'
import { Category } from '../../types'

type Props = {
  category: Category
  maxDepth?: number
}

export const CategoryMenuItem = ({ category, maxDepth = 1 }: Props) => {
  const hasChildrenAndContinuing = !!category.subCategories && maxDepth > 0
  const hasNoChildrenAndAlmostDone = !category.subCategories && maxDepth === 1
  if (hasChildrenAndContinuing) {
    return (
      <optgroup label={category.display_name}>
        {category?.subCategories?.map(category => (
          <CategoryMenuItem
            key={category.category}
            category={category}
            maxDepth={maxDepth - 1}
          />
        ))}
      </optgroup>
    )
  } else if (hasNoChildrenAndAlmostDone) {
    return (
      <optgroup label={category.display_name}>
        <CategoryMenuItem category={category} maxDepth={maxDepth - 1} />
      </optgroup>
    )
  } else {
    return <option value={category.category}>{category.display_name}</option>
  }
}
