import React from 'react'
import Select, {
  DropdownIndicatorProps,
  GroupHeadingProps,
  GroupBase,
  OptionProps,
  components,
} from 'react-select'
import { DATE_FORMAT } from '../../config/general'
import { useLayerContext } from '../../contexts/LayerContext'
import Check from '../../icons/Check'
import ChevronDown from '../../icons/ChevronDown'
import MinimizeTwo from '../../icons/MinimizeTwo'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction, CategorizationType, Category } from '../../types'
import { SuggestedMatch } from '../../types/bank_transactions'
import { CategoryEntry } from '../../types/categories'
import { Badge } from '../Badge'
import { BadgeSize } from '../Badge/Badge'
import { CategorySelectDrawer } from './CategorySelectDrawer'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'

type Props = {
  name?: string
  bankTransaction: BankTransaction
  value: CategoryOption | undefined
  onChange: (newValue: CategoryOption) => void
  disabled?: boolean
  className?: string
  excludeMatches?: boolean
  asDrawer?: boolean
}

export enum OptionActionType {
  CATEGORY = 'category',
  MATCH = 'match',
  HIDDEN = 'hidden',
}

export interface CategoryOptionPayload {
  id: string
  option_type: OptionActionType
  display_name: string
  date?: string
  amount?: number
  type?: string
  stable_name?: string
  entries?: CategoryEntry[]
  subCategories?: Category[]
}

export interface CategoryOption {
  type: string
  disabled?: boolean
  payload: CategoryOptionPayload
}

export const mapCategoryToOption = (category: Category): CategoryOption => {
  return {
    type: OptionActionType.CATEGORY,
    payload: {
      id: category.id,
      option_type: OptionActionType.CATEGORY,
      display_name: category.display_name,
      type: category.type,
      stable_name: category.stable_name,
      entries: category.entries,
      subCategories: category.subCategories,
    },
  }
}

export const mapCategoryToExclusionOption = (category: Category): CategoryOption => {
  return {
    type: OptionActionType.CATEGORY,
    payload: {
      id: category.id,
      option_type: OptionActionType.CATEGORY,
      display_name: category.display_name,
      type: 'ExclusionNested',
      stable_name: category.stable_name,
      entries: category.entries,
      subCategories: category.subCategories,
    },
  }
}

export const mapSuggestedMatchToOption = (
  record: SuggestedMatch,
): CategoryOption => {
  return {
    type: OptionActionType.MATCH,
    payload: {
      id: record.id,
      option_type: OptionActionType.MATCH,
      display_name: record.details.description,
      amount: record.details.amount,
    },
  }
}

const DropdownIndicator:
  | React.ComponentType<
      DropdownIndicatorProps<CategoryOption, false, GroupBase<CategoryOption>>
    >
  | null
  | undefined = props => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown />
    </components.DropdownIndicator>
  )
}

const GroupHeading = (
  props: GroupHeadingProps<CategoryOption, false, GroupBase<CategoryOption>>,
) => {
  return (
    <components.GroupHeading
      className={classNames(
        props.className,
        props.children === 'Match' || props.children === 'All categories'
          ? 'Layer__select__group-heading--main'
          : '',
      )}
      {...props}
    />
  )
}

const Option = (
  props: OptionProps<CategoryOption, false, GroupBase<CategoryOption>>,
) => {
  if (props.data.payload.option_type === 'hidden') {
    return
  }

  if (props.data.type === 'match') {
    return (
      <components.Option
        {...props}
        className={`${props.className} Layer__select__option-content__match`}
      >
        <div className='Layer__select__option-content__match__main-row'>
          <span className='Layer__select__option-content__match__date'>
            {props.data.payload.date &&
              formatTime(parseISO(props.data.payload.date), DATE_FORMAT)}
          </span>
          <span className='Layer__select__option-content__match__description'>
            {props.data.payload.display_name}
          </span>
        </div>
        <div className='Layer__select__option-content__match__amount-row'>
          <span className='Layer__select__option-content__match__amount'>
            ${formatMoney(props.data.payload.amount)}
          </span>
        </div>
      </components.Option>
    )
  }

  return (
    <components.Option
      {...props}
      className={`Layer__select__option-menu-content ${props.className}`}
    >
      <div>{props.data.payload.display_name}</div>
      {props.isSelected ? (
        <span className='Layer__select__option-menu-content-check'>
          <Check size={16} />
        </span>
      ) : null}
    </components.Option>
  )
}

const allCategoriesDivider: GroupBase<CategoryOption>[] = [
  {
    label: 'All categories',
    options: [
      {
        type: 'All categories',
        disabled: true,
        payload: {
          id: 'all_categories',
          option_type: OptionActionType.HIDDEN,
          display_name: 'ALL CATEGORIES',
        },
      } satisfies CategoryOption,
    ],
  },
]

function flattenCategories(
  categories: Category[],
): GroupBase<CategoryOption>[] {
  function getLeafCategories(category: Category): Category[] {
    if (!category.subCategories || category.subCategories.length === 0) {
      return [category];
    }
    return category.subCategories.flatMap(subCategory => getLeafCategories(subCategory));
  }
  return categories.map(category => {
      return {
        label: category.display_name,
        options: getLeafCategories(category).map(x => mapCategoryToOption(x))
      } satisfies GroupBase<CategoryOption>
    }
  )
}

export const CategorySelect = ({
  bankTransaction,
  name,
  value,
  onChange,
  disabled,
  className,
  excludeMatches = false,
  asDrawer = false,
}: Props) => {
  const { categories } = useLayerContext()

  const matchOptions =
    !excludeMatches && bankTransaction?.suggested_matches
      ? [
          {
            label: 'Match',
            options: bankTransaction.suggested_matches.map(x => {
              return {
                type: OptionActionType.MATCH,
                payload: {
                  id: x.id,
                  option_type: OptionActionType.MATCH,
                  display_name: x.details.description,
                  date: x.details.date,
                  amount: x.details.amount,
                },
              } satisfies CategoryOption
            }),
          } satisfies GroupBase<CategoryOption>,
        ]
      : []

  const suggestedOptions =
    bankTransaction?.categorization_flow?.type ===
    CategorizationType.ASK_FROM_SUGGESTIONS
      ? [
          {
            label: 'Suggestions',
            options: bankTransaction.categorization_flow.suggestions.map(x =>
              mapCategoryToOption(x),
            ),
          } satisfies GroupBase<CategoryOption>,
        ]
      : []

  const categoryOptions = flattenCategories(categories)

  const options = [
    ...matchOptions,
    ...suggestedOptions,
    ...allCategoriesDivider,
    ...categoryOptions,
  ]

  const selected = value
    ? value
    : !excludeMatches &&
      matchOptions?.length === 1 &&
      matchOptions[0].options.length === 1
    ? matchOptions[0].options[0]
    : undefined

  const placeholder =
    matchOptions?.length === 1 && matchOptions[0].options.length > 1
      ? `${matchOptions[0].options.length} possible matches...`
      : 'Categorize or match...'

  if (asDrawer) {
    return <CategorySelectDrawer onSelect={onChange} selected={value} />
  }

  // The menu does not show in all cases unless the
  // menuPortalTarget and styles lines exist
  // See: https://stackoverflow.com/questions/55830799/how-to-change-zindex-in-react-select-drowpdown
  return (
    <Select<CategoryOption>
      name={name}
      className={`Layer__category-menu Layer__select ${className ?? ''}`}
      classNamePrefix='Layer__select'
      classNames={{
        menu: () => 'Layer__select__menu--lg',
      }}
      options={options}
      isSearchable={true}
      placeholder={placeholder}
      defaultValue={selected}
      formatOptionLabel={props => (
        <div className='Layer__select__option-label'>
          {props.type === 'match' && (
            <Badge size={BadgeSize.SMALL} icon={<MinimizeTwo size={11} />}>
              Match
            </Badge>
          )}
          <span>{props.payload.display_name}</span>
        </div>
      )}
      value={value}
      onChange={newValue => newValue && onChange(newValue)}
      getOptionLabel={category => category.payload.display_name}
      getOptionValue={category => category.payload.id}
      menuPortalTarget={document.body}
      styles={{
        menuPortal: base => ({ ...base, zIndex: 9999 }),
      }}
      components={{ DropdownIndicator, GroupHeading, Option }}
      isDisabled={disabled}
      isOptionDisabled={option => option.disabled ?? false}
    />
  )
}
