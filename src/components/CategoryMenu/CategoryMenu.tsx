import React, { useContext } from 'react'
import { LayerContext } from '../../contexts/LayerContext'
import { CategoryMenuItem } from './CategoryMenuItem'

type Props = {
  selectedCategory: string
}

export const CategoryMenu = ({ selectedCategory }: Props) => {
  const { categories } = useContext(LayerContext)
  return (
    <select>
      {categories.map(category => (
        <CategoryMenuItem
          category={category}
          selectedCategory={selectedCategory}
        />
      ))}
    </select>
  )
}
