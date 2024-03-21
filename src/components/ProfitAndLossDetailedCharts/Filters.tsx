import React from 'react'
import Select from 'react-select'
import {
  Scope,
  SidebarScope,
  ProfitAndLossFilters,
} from '../../hooks/useProfitAndLoss/useProfitAndLoss'
import { LineBaseItem } from '../../types/line_item'
import { Text, TextSize } from '../Typography'

export interface FiltersProps {
  filteredData: LineBaseItem[]
  sidebarScope: SidebarScope
  filters: ProfitAndLossFilters
  setFilterTypes: (scope: Scope, types: string[]) => void
}

export const Filters = ({
  filteredData,
  sidebarScope,
  filters,
  setFilterTypes,
}: FiltersProps) => {
  return (
    <div className='filters'>
      <Text size={TextSize.sm} className='Layer__label'>
        Filters
      </Text>
      <Select
        className='type-select'
        classNamePrefix='Layer__select'
        value={
          sidebarScope && filters[sidebarScope]?.types
            ? sidebarScope &&
              filters[sidebarScope]?.types?.map(x => ({
                value: x,
                label: x,
              }))
            : []
        }
        isMulti
        isClearable={false}
        options={
          [...new Set(filteredData?.map(x => x.type))].map(x => ({
            label: x,
            value: x,
          })) as unknown as readonly { value: string; label: string }[]
        }
        onChange={selected => {
          setFilterTypes(
            sidebarScope ?? 'expenses',
            selected.map(x => x.value),
          )
        }}
      />
    </div>
  )
}
