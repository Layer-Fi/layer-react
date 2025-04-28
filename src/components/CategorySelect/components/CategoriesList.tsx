import { ListBoxSection, Header, ListBoxItem, Collection } from 'react-aria-components'
import { CategoryOption, CategoryOptionPayload, CategoryWithHide, OptionActionType } from '../types'
import { Text, TextSize, TextWeight } from '../../Typography'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip/Tooltip'
import InfoIcon from '../../../icons/InfoIcon'
import CheckIcon from '../../../icons/Check'
import { CategorySelectProps } from '../types'
import { Category } from '../../../types'

const MAX_INDENT_LEVEL = 3

type CategoriesListProps = {
  option: CategoryWithHide
  level: number
  accountName: string
  onSelect: (newValue: CategoryOption) => void
  selected: CategoryOption | undefined
  showTooltips: CategorySelectProps['showTooltips']
}

export const CategoriesList = ({ option, level = 0, accountName, onSelect, selected, showTooltips }: CategoriesListProps) => {
  if (option?.subCategories) {
    return (
      <>
        <Header
          style={{
            display: option.hide ? 'none' : 'flex',
            paddingLeft: `${(Math.min(MAX_INDENT_LEVEL, Math.max(level, 1)) * 12) + 8}px`,
          }}
        >
          {level === 0
            ? <Text size={TextSize.xs} status='disabled'>{option.display_name}</Text>
            : <Text weight={TextWeight.bold}>{option.display_name}</Text>}
        </Header>
        <ListBoxSection className='Layer__category-select__list-box-section' key={`${accountName}-${option.category}-section`} style={{ display: (option).hide ? 'none' : 'flex' }}>
          {option.subCategories.map((o, i) => (
            <Collection key={`${accountName}-${option.category}-section-${i}`} items={o.subCategories ?? []}>
              <CategoriesList
                option={o}
                level={level + 1}
                accountName={option.display_name}
                onSelect={onSelect}
                selected={selected}
                showTooltips={showTooltips}
              />
            </Collection>
          ))}
        </ListBoxSection>
      </>
    )
  }

  return (
    <ListBoxItem
      key={`${accountName}-${option.category}`}
      className='Layer__category-select__list-item'
      style={{
        paddingLeft: `${8 + (Math.min(MAX_INDENT_LEVEL, level) * 12)}px`,
        display: option.hide ? 'none' : 'grid',
      }}
      textValue={option?.display_name}
      onAction={() => {
        onSelect({
          type: 'category',
          payload: {
            ...option,
            option_type: 'category' as OptionActionType,
            subCategories: option.subCategories as Category[],
            id: 'id' in option ? option.id : undefined,
            stable_name: 'stable_name' in option ? option.stable_name : undefined,
          } as CategoryOptionPayload,
        })
      }}
    >
      <div slot='name'>
        <Text>{option?.display_name}</Text>

        {option.description && (
          <div slot='tooltip' onClick={e => e.stopPropagation()}>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon />
              </TooltipTrigger>
              <TooltipContent>
                {option.description ?? 'Test'}
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      <span slot='account'>
        <Text size={TextSize.sm} status='disabled' ellipsis>{accountName}</Text>
      </span>

      {'id' in option && selected?.payload.id === option.id && (
        <CheckIcon slot='icon' size={12} />
      )}
    </ListBoxItem>
  )
}
