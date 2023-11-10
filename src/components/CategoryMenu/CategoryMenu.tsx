import React from 'react'
import { useLayerContext } from '../../hooks/useLayerContext'
import { Category } from '../../types'
import { CategoryMenuItem } from './CategoryMenuItem'

type Props = {
  selectedCategory: string
}

export const CategoryMenu = ({ selectedCategory }: Props) => {
  const { categories } = useLayerContext()
  return (
    <select defaultValue={selectedCategory}>
      {categories.map((category: Category) => (
        <CategoryMenuItem key={category.category} category={category} />
      ))}
    </select>
  )
}
