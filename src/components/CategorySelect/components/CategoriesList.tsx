import { CategoryOption, CategorySelectProps } from '../types'
import { ListItem } from './ListItem'

type CategoriesListProps = {
  option: CategoryOption
  level: number
  accountName: string
  showTooltips: CategorySelectProps['showTooltips']
  selected?: CategoryOption
}

export const CategoriesList = ({ option, level = 0, accountName, showTooltips, selected }: CategoriesListProps) => {
  if (!option) {
    return null
  }

  if (option?.payload?.subCategories) {
    return (
      <>
        <ListItem
          option={option}
          level={level}
          accountName={accountName}
          showTooltips={showTooltips}
          selected={selected}
        />

        {option.payload?.subCategories?.map((o, i) => (
          <CategoriesList
            key={`${o.payload.display_name}-${i}-categories`}
            option={o}
            level={level + 1}
            accountName={option.payload.display_name}
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
      accountName={accountName}
      showTooltips={showTooltips}
      selected={selected}
    />
  )
}
