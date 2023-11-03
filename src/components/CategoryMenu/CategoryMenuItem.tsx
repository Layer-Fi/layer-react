import React, { useContext } from 'react'
import { Category } from '../../types'

type Props = {
  selectedCategory: string
  category: Category
  maxDepth?: number
}

export const CategoryMenuItem = ({
  selectedCategory,
  category,
  maxDepth = 1,
}: Props) => {
  if (!!category.subCategories && maxDepth > 0) {
    return (
      <optgroup label={category.display_name}>
        {category.subCategories.map(category => (
          <CategoryMenuItem
            key={category.category}
            category={category}
            selectedCategory={selectedCategory}
            maxDepth={maxDepth - 1}
          />
        ))}
      </optgroup>
    )
  } else {
    return <option value={category.category}>{category.display_name}</option>
  }
}
