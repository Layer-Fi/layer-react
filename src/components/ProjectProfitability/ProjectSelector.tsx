import React from 'react'
import Select from 'react-select'
import { useTags } from '../../hooks/useProjects'

export function ProjectSelector() {
  const { activeValue, valueOptions, setActiveValue } = useTags()

  return (
    <Select
      className='Layer__category-menu Layer__select'
      classNamePrefix='Layer__select'
      options={valueOptions}
      placeholder='Select a project...'
      value={activeValue ?? null}
      isClearable
      onChange={(selectedOption) => {
        setActiveValue({ key: 'project', activeValue: selectedOption?.value })
      }}
    />
  )
}
