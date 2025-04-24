import { BankTransaction, Category } from '../../types'
import classNames from 'classnames'
import { useCategories } from '../../hooks/categories/useCategories'
import { Button, Popover, DialogTrigger, Dialog, ListBox, ListBoxSection, Header, ListBoxItem, Collection } from 'react-aria-components'
import { Input } from '../Input/Input'
import { ReactNode, useMemo, useState } from 'react'
import { CategoryOption, CategoryOptionPayload, CategoryWithHide } from './types'
import { buildMatchOptions, buildSuggestedOptions, filterCategories } from './utils'
import { Text, TextSize, TextWeight } from '../Typography'
import Plus from '../../icons/Plus'
import { CategorySelectDrawer } from './CategorySelectDrawer'
import pluralize from 'pluralize'
import ChevronDown from '../../icons/ChevronDown'

type CategorySelectProps = {
  name?: string
  bankTransaction: BankTransaction
  value: CategoryOption | undefined
  onChange: (newValue: CategoryOption) => void
  disabled?: boolean
  className?: string
  showTooltips: boolean
  excludeMatches?: boolean
  asDrawer?: boolean
}

const MAX_INDENT_LEVEL = 3

const MenuSection = ({ children }: { children: ReactNode }) => (
  <div className='Layer__category-select__menu-section'>{children}</div>
)

const MenuItem = ({ text, icon }: { text: string, icon?: ReactNode }) => (
  <div className='Layer__category-select__menu-item'>
    <Text>{text}</Text>
    {icon}
  </div>
)

type CategoryListProps = {
  option: Category & { hide?: boolean }
  level: number
  accountName: string
  onSelect: (newValue: CategoryOption) => void
  selected: CategoryOption | undefined
}

const CategoryList = ({ option, level = 0, accountName, onSelect, selected }: CategoryListProps) => {
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
            ? (
              <Text size={TextSize.xs} status='disabled'>{option.display_name}</Text>
            )
            : (
              <Text weight={TextWeight.bold}>{option.display_name}</Text>
            )}
        </Header>
        <ListBoxSection className='Layer__category-select__list-box-section' key={`${accountName}-${option.category}-section`} style={{ display: (option as CategoryWithHide).hide ? 'none' : 'flex' }}>
          {option.subCategories.map((o, i) => (
            <Collection key={`${accountName}-${option.category}-section-${i}`} items={o.subCategories ?? []}>
              <CategoryList option={o} level={level + 1} accountName={option.display_name} onSelect={onSelect} selected={selected} />
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        display: option.hide ? 'none' : 'flex',
      }}
      textValue={option?.display_name}
      onAction={() => {
        onSelect({
          type: 'category',
          payload: { ...option, option_type: 'category' } as CategoryOptionPayload,
        })
      }}
    >
      <Text>{option?.display_name}</Text>
      <Text size={TextSize.sm} status='disabled'>{accountName}</Text>
    </ListBoxItem>
  )
}

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

  const { data: categories } = useCategories()

  const matches = buildMatchOptions(bankTransaction, excludeMatches, search)
  const suggestions = buildSuggestedOptions(bankTransaction, search)
  const allCategories = useMemo<CategoryWithHide[]>(() => {
    if (!search) return categories

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
          <Text ellipsis>{value?.payload.display_name ?? placeholder}</Text>
          <ChevronDown size={16} />
        </Button>
        <input type='hidden' name={name} value={value?.payload.display_name} />
        <Popover className='Layer__category-select__popover'>
          <Dialog>
            <Input
              placeholder='Search category'
              className='Layer__category-select__search-input'
              value={search}
              onChange={e => setSearch((e.target as HTMLInputElement).value)}
            />
            {(matches && matches.length > 0)
            && (
              <MenuSection>
                <ListBox slot='listbox' aria-label='Matches'>
                  <ListBoxSection>
                    <Header slot='header'>
                      <Text size={TextSize.xs} status='disabled'>Match</Text>
                    </Header>
                    {matches?.map((option, index) => {
                      /** @TODO - account name - need to find in all categories */
                      return (
                        <ListBoxItem className='Layer__category-select__ms-list-item' key={index} textValue={option.payload.display_name} onAction={() => onSelect(option)}>
                          <Text slot='name'>{option.payload.display_name}</Text>
                          {/* <Text slot='account' size={TextSize.sm}>{option.payload.option_type}</Text> */}
                        </ListBoxItem>
                      )
                    })}
                  </ListBoxSection>
                </ListBox>
              </MenuSection>
            )}

            {(suggestions && suggestions.length > 0)
            && (
              <MenuSection>
                <ListBox slot='listbox' aria-label='Suggestions'>
                  <ListBoxSection>
                    <Header slot='header'>
                      <Text size={TextSize.xs} status='disabled'>Suggestions</Text>
                    </Header>
                    {suggestions.map((option, index) => {
                      /** @TODO - account name - need to find in all categories */
                      return (
                        <ListBoxItem className='Layer__category-select__ms-list-item' key={index} textValue={option.payload.display_name} onAction={() => onSelect(option)}>
                          <Text slot='name'>{option.payload.display_name}</Text>
                          {/* <Text slot='account' size={TextSize.sm}>{option.payload.option_type}</Text> */}
                        </ListBoxItem>
                      )
                    })}
                  </ListBoxSection>
                </ListBox>
              </MenuSection>
            )}

            <MenuSection>
              <ListBox
                items={allCategories as unknown as CategoryWithHide[]}
                className='Layer__category-select__all-categories'
                aria-label='All categories'
              >
                {section => (
                  <ListBoxSection
                    className='Layer__category-select__list-box-section'
                    id={`${section.type}-${'id' in section ? section.id : section.stable_name}`}
                    style={{
                      display: section.hide ? 'none' : 'flex',
                    }}
                  >
                    <CategoryList option={section} level={0} accountName={section.display_name} onSelect={onSelect} selected={value} />
                  </ListBoxSection>
                )}
              </ListBox>
            </MenuSection>

            <MenuItem text='Add new category' icon={<Plus size={11} />} />

          </Dialog>
        </Popover>
      </DialogTrigger>
    </div>
  )
}
