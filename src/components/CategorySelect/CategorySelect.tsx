import { ReactNode, useMemo, useState } from 'react'
import classNames from 'classnames'
import { useCategories } from '../../hooks/categories/useCategories'
import { Button, Popover, DialogTrigger, ListBox, ListBoxSection, Header, ListBoxItem, Collection } from 'react-aria-components'
import { Input } from '../Input/Input'
import { BankTransaction, Category } from '../../types'
import { CategoryOption, CategoryOptionPayload, CategoryWithHide, OptionActionType } from './types'
import { buildMatchOptions, buildSuggestedOptions, filterCategories, findParentCategory } from './utils'
import { Text, TextSize, TextWeight } from '../Typography'
import { CategorySelectDrawer } from './CategorySelectDrawer'
import pluralize from 'pluralize'
import ChevronDown from '../../icons/ChevronDown'
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip/Tooltip'
import InfoIcon from '../../icons/InfoIcon'
import Plus from '../../icons/Plus'
import { parseISO, format as formatTime } from 'date-fns'
import { centsToDollars as formatMoney } from '../../models/Money'
import { DATE_FORMAT } from '../../config/general'
import { Badge, BadgeSize } from '../Badge/Badge'
import MinimizeTwo from '../../icons/MinimizeTwo'
import { VStack } from '../ui/Stack/Stack'
import CheckIcon from '../../icons/Check'

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
  option: CategoryWithHide
  level: number
  accountName: string
  onSelect: (newValue: CategoryOption) => void
  selected: CategoryOption | undefined
  showTooltips: CategorySelectProps['showTooltips']
}

const CategoryList = ({ option, level = 0, accountName, onSelect, selected, showTooltips }: CategoryListProps) => {
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
              <CategoryList
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
            id: 'id' in option ? option.id : '',
            stable_name: 'stable_name' in option ? option.stable_name : undefined,
          } as CategoryOptionPayload,
        })
      }}
    >
      <Text slot='name'>{option?.display_name}</Text>

      <span slot='account'>
        <Text size={TextSize.sm} status='disabled' ellipsis>{accountName}</Text>
      </span>

      {option.description && (
        <div className='Layer__select__option-menu--tooltip' slot='tooltip' onClick={e => e.stopPropagation()}>
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon />
            </TooltipTrigger>
            <TooltipContent>
              {option.description}
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {'id' in option && selected?.payload.id === option.id && (
        <CheckIcon slot='icon' size={12} />
      )}
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
          {(matches && matches.length > 0)
          && (
            <MenuSection>
              <ListBox slot='listbox' aria-label='Matches'>
                <ListBoxSection>
                  <Header slot='header'>
                    <Text size={TextSize.xs} status='disabled'>Match</Text>
                  </Header>
                  {matches?.map((option, index) => (
                    <ListBoxItem className='Layer__category-select__ms-list-item' key={index} textValue={option.payload.display_name} onAction={() => onSelect(option)}>
                      <VStack slot='label'>
                        <Text slot='date-and-amount' size={TextSize.sm}>
                          {option.payload.date && formatTime(parseISO(option.payload.date), DATE_FORMAT)}
                          {' '}
                          |
                          {' '}
                          $
                          {formatMoney(option.payload.amount)}
                        </Text>
                        <Text slot='name'>{option.payload.display_name}</Text>
                      </VStack>
                      {value?.payload?.id === option.payload.id && (
                        <span slot='icon'>
                          <CheckIcon size={12} />
                        </span>
                      )}
                    </ListBoxItem>
                  ),
                  )}
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
                  {suggestions.map((option, index) => (
                    <ListBoxItem className='Layer__category-select__ms-list-item' key={index} textValue={option.payload.display_name} onAction={() => onSelect(option)}>
                      <VStack slot='label'>
                        <Text slot='name'>{option.payload.display_name}</Text>
                        <Text slot='account' size={TextSize.sm}>
                          {findParentCategory(categories, option.payload.id)?.display_name}
                        </Text>
                      </VStack>
                      {value?.payload?.id === option.payload.id && (
                        <span slot='icon'>
                          <CheckIcon size={12} />
                        </span>
                      )}
                    </ListBoxItem>
                  ),
                  )}
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
                  id={`${section.type}-${section.category}`}
                  style={{
                    display: section.hide ? 'none' : 'flex',
                  }}
                >
                  <CategoryList
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
              @TODO - When adding new categories is ready */}
          <MenuItem text='Add new category' icon={<Plus size={11} />} />

        </Popover>
      </DialogTrigger>
    </div>
  )
}
