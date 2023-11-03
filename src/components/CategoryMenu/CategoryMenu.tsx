import React, { useContext } from 'react'
import { LayerContext } from '../../contexts/LayerContext'
import { CategoryMenuItem } from './CategoryMenuItem'

type Props = {
  selectedCategory: string
}

export const CategoryMenu = ({ selectedCategory }: Props) => {
  const { categories } = useContext(LayerContext)
  return (
    <select defaultValue={selectedCategory}>
      {categories.map(category => (
        <CategoryMenuItem
          key={category.category}
          category={category}
          selectedCategory={selectedCategory}
        />
      ))}
    </select>
  )
}
