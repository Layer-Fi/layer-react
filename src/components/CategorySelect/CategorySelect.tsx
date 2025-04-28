import { Button, Popover, DialogTrigger, ListBox, ListBoxSection } from 'react-aria-components'
import { Input } from '../Input/Input'
import { useMemo, useState } from 'react'
import { useLayerContext } from '../../contexts/LayerContext/LayerContext'
import { CategoryOption, CategorySelectProps, CategoryWithHide } from './types'
import { buildMatchOptions, buildSuggestedOptions, filterCategories } from './utils'
import { Text } from '../Typography'
import { CategorySelectDrawer } from './CategorySelectDrawer'
import classNames from 'classnames'
import pluralize from 'pluralize'
import ChevronDown from '../../icons/ChevronDown'
import { Badge, BadgeSize } from '../Badge/Badge'
import MinimizeTwo from '../../icons/MinimizeTwo'
import { CategoriesList } from './components/CategoriesList'
import { MatchesList } from './components/MatchesList'
import { MenuSection } from './components/MenuSection'
import { SuggestionsList } from './components/SuggestionsList'

/* @TODO - uncomment when adding category is available
const MenuItem = ({ text, icon }: { text: string, icon?: ReactNode }) => (
  <div className='Layer__category-select__menu-item'>
    <Text>{text}</Text>
    {icon}
  </div>
) */

export const CategorySelect = ({
  bankTransaction,
  name,
  value,
  onChange,
  disabled,
  className,
  showTooltips,
  excludeMatches = false,
  asDrawer = false,
}: CategorySelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { categories } = useLayerContext()

  const matches = buildMatchOptions(bankTransaction, excludeMatches, search)
  const suggestions = buildSuggestedOptions(bankTransaction, search)
  const allCategories = useMemo<CategoryWithHide[]>(() => {
    if (!search) return categories as CategoryWithHide[]

    return filterCategories(categories, search.toLowerCase())
  }, [search, categories])

  const placeholder = matches && matches.length > 1
    ? pluralize('possible match', matches.length, true)
    : 'Categorize or match...'

  const onSelect = (newValue: CategoryOption) => {
    setIsOpen(false)
    onChange(newValue)
  }

  if (asDrawer) {
    return (
      <CategorySelectDrawer
        onSelect={onChange}
        selected={value}
        showTooltips={showTooltips}
      />
    )
  }

  return (
    <div className={classNames('Layer__category-select', className)}>
      <DialogTrigger isOpen={isOpen} onOpenChange={v => setIsOpen(v)}>
        <Button aria-label='Menu' className='Layer__category-select__trigger-btn' isDisabled={disabled}>
          {value?.type === 'match' && (
            <Badge slot='match-badge' size={BadgeSize.SMALL} icon={<MinimizeTwo size={11} />}>
              Match
            </Badge>
          )}
          <Text slot='value' ellipsis>
            {value?.payload.display_name ?? placeholder}
          </Text>
          <ChevronDown slot='icon'size={16} />
        </Button>
        <input type='hidden' name={name} value={value?.payload.display_name} aria-hidden='true' />
        <Popover className='Layer__category-select__popover'>
          <Input
            placeholder='Search category'
            className='Layer__category-select__search-input'
            value={search}
            onChange={e => setSearch((e.target as HTMLInputElement).value)}
            aria-label='Search category'
          />

          <MatchesList
            matches={matches}
            onSelect={onSelect}
            value={value}
          />

          <SuggestionsList
            suggestions={suggestions}
            categories={categories}
            onSelect={onSelect}
            value={value}
          />

          <MenuSection>
            <ListBox
              items={allCategories as unknown as CategoryWithHide[]}
              className='Layer__category-select__all-categories'
              aria-label='All categories'
            >
              {section => (
                <ListBoxSection
                  className='Layer__category-select__list-box-section'
                  id={`${section.type}-${section.category}`}
                  style={{
                    display: section.hide ? 'none' : 'flex',
                  }}
                >
                  <CategoriesList
                    option={section}
                    level={0}
                    accountName={section.display_name}
                    onSelect={onSelect}
                    selected={value}
                    showTooltips={showTooltips}
                  />
                </ListBoxSection>
              )}
            </ListBox>
          </MenuSection>

          {/*
            @TODO - When adding new categories is ready
          <MenuItem text='Add new category' icon={<Plus size={11} />} />
          */}

        </Popover>
      </DialogTrigger>
    </div>
  )
}
