import { Header, ListBoxItem } from 'react-aria-components'
import { CategoryOption, CategorySelectProps } from '../types'
import { ListItem } from './ListItem'
import { Text, TextSize } from '../../Typography'

type CategoriesListProps = {
  option: CategoryOption
  level?: number
  indentationLevel?: number
  showTooltips: CategorySelectProps['showTooltips']
  selected?: CategoryOption
}

export const CategoriesList = ({ option, level = 0, indentationLevel = 0, showTooltips, selected }: CategoriesListProps) => {
  if (!option) {
    return null
  }

  if (option?.payload?.subCategories && level === 0) {
    return (
      <>
        <ListBoxItem isDisabled={true} textValue=' '>
          <Header slot='header'>
            <Text size={TextSize.xs} status='disabled'>{option.payload.display_name}</Text>
          </Header>
        </ListBoxItem>

        {option.payload?.subCategories?.map((o, i) => (
          <CategoriesList
            key={`${o.payload.display_name}-${i}-categories`}
            option={o}
            level={level + 1}
            indentationLevel={level}
            showTooltips={showTooltips}
            selected={selected}
          />
        ))}
      </>
    )
  }

  if (option?.payload?.subCategories) {
    return (
      <>
        <ListItem
          option={option}
          indentationLevel={indentationLevel}
          showTooltips={showTooltips}
          selected={selected}
          isDisabled={level === 0}
        />

        {option.payload?.subCategories?.map((o, i) => (
          <CategoriesList
            key={`${o.payload.display_name}-${i}-categories`}
            option={o}
            level={level + 1}
            indentationLevel={indentationLevel + 1}
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
      indentationLevel={indentationLevel}
      showTooltips={showTooltips}
      selected={selected}
    />
  )
}
