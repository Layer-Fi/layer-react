import React from 'react'
import Select from 'react-select'
import { useTags } from '../../hooks/tags/useTags'

export function ProjectSelector() {
  const { category, categoryOptions, setActiveCategory } = useTags()

  return (
    <Select
      className='Layer__category-menu Layer__select'
      classNamePrefix='Layer__select'
      options={categoryOptions}
      placeholder='Select a project...'
      value={category ?? null}
      isClearable
      onChange={selectedOption => {
        setActiveCategory({ activeCategory: selectedOption?.value })
      }}
    />
  )
}
