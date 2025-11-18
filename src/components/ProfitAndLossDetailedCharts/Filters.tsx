import Select, { components } from 'react-select'

import type { PnlChartLineItem } from '@utils/profitAndLossUtils'
import {
  type ProfitAndLossFilters,
  type Scope,
  type SidebarScope,
} from '@hooks/useProfitAndLoss/useProfitAndLoss'
import ChevronDown from '@icons/ChevronDown'
import { Text, TextSize } from '@components/Typography/Text'

export interface FiltersProps {
  filteredData: PnlChartLineItem[]
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
        className='Layer__select type-select'
        classNamePrefix='Layer__select'
        value={
          sidebarScope && filters[sidebarScope]?.types
            ? sidebarScope
            && filters[sidebarScope]?.types?.map(x => ({
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
          })) as unknown as readonly { value: string, label: string }[]
        }
        onChange={(selected) => {
          setFilterTypes(
            sidebarScope ?? 'expenses',
            selected.map(x => x.value),
          )
        }}
        components={{
          DropdownIndicator: props => (
            <components.DropdownIndicator {...props}>
              <ChevronDown />
            </components.DropdownIndicator>
          ),
          Placeholder: props => (
            <components.Placeholder {...props}>
              <div className='Layer__select__multi-all-placeholder-badge'>
                All
              </div>
            </components.Placeholder>
          ),
        }}
      />
    </div>
  )
}
