import React from 'react'
import { useLayerContext } from '../../hooks/useLayerContext'
import { Category } from '../../types'
import { CategoryMenuItem } from './CategoryMenuItem'

type Props = {
  name?: string
  selectedCategory: string
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export const CategoryMenu = ({ name, selectedCategory, onChange }: Props) => {
  const { categories } = useLayerContext()
  return (
    <select name={name} onChange={onChange} defaultValue={selectedCategory}>
      {categories.map((category: Category) => (
        <CategoryMenuItem key={category.category} category={category} />
      ))}
    </select>
  )
}
