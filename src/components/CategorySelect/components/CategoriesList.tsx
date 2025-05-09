import { CategoryOption, CategorySelectProps } from '../types'
import { ListItem } from './ListItem'

type CategoriesListProps = {
  option: CategoryOption
  level: number
  showTooltips: CategorySelectProps['showTooltips']
  selected?: CategoryOption
}

export const CategoriesList = ({ option, level = 0, showTooltips, selected }: CategoriesListProps) => {
  if (!option) {
    return null
  }

  if (option?.payload?.subCategories) {
    return (
      <>
        <ListItem
          option={option}
          level={level}
          showTooltips={showTooltips}
          selected={selected}
          isDisabled={level === 0}
        />

        {option.payload?.subCategories?.map((o, i) => (
          <CategoriesList
            key={`${o.payload.display_name}-${i}-categories`}
            option={o}
            level={level + 1}
            showTooltips={showTooltips}
            selected={selected}
          />
        ))}
      </>
    )
  }

  return (
    <ListItem
      option={option}
      level={level}
      showTooltips={showTooltips}
      selected={selected}
    />
  )
}
