import Select, {
  DropdownIndicatorProps,
  GroupHeadingProps,
  GroupBase,
  OptionProps,
  components,
} from 'react-select'
import { DATE_FORMAT } from '../../config/general'
import Check from '../../icons/Check'
import ChevronDown from '../../icons/ChevronDown'
import InfoIcon from '../../icons/InfoIcon'
import MinimizeTwo from '../../icons/MinimizeTwo'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction, CategorizationType, Category } from '../../types'
import { SuggestedMatch, type CategoryWithEntries } from '../../types/bank_transactions'
import { MatchDetails } from '../../types/match_details'
import { Badge } from '../Badge'
import { BadgeSize } from '../Badge/Badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip'
import { Text, TextSize } from '../Typography'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'
import { useCategories } from '../../hooks/categories/useCategories'
import { useMatchDetailsContext } from '../../contexts/MatchDetailsContext'
import { CategorySelectDrawer } from './CategorySelectDrawer'

type Props = {
  name?: string
  bankTransaction?: BankTransaction
  value: CategoryOption | undefined
  onChange: (newValue: CategoryOption) => void
  disabled?: boolean
  className?: string
  showTooltips: boolean
  excludeMatches?: boolean
  hideMainCategories?: string[]
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
  description?: string
  date?: string
  amount?: number
  type?: string
  stable_name?: string
  entries?: CategoryWithEntries['entries']
  subCategories: Category[] | null
  details?: MatchDetails
}

export interface CategoryOption {
  type: string
  disabled?: boolean
  payload: CategoryOptionPayload
}

export const mapCategoryToOption = (category: CategoryWithEntries): CategoryOption => {
  return {
    type: OptionActionType.CATEGORY,
    payload: {
      id: 'id' in category ? category.id : '',
      option_type: OptionActionType.CATEGORY,
      display_name: category.display_name,
      type: category.type,
      description: category.description ?? undefined,
      stable_name: ('stable_name' in category) ? category.stable_name ?? '' : '',
      entries: category.entries,
      subCategories: category.subCategories,
    },
  }
}

export const mapCategoryToExclusionOption = (
  category: CategoryWithEntries & { type: 'ExclusionNested' },
): CategoryOption => {
  return {
    type: OptionActionType.CATEGORY,
    payload: {
      id: category.id,
      option_type: OptionActionType.CATEGORY,
      display_name: category.display_name,
      type: 'ExclusionNested',
      stable_name: '',
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
      subCategories: null,
    },
  }
}

const DropdownIndicator:
  | React.ComponentType<
    DropdownIndicatorProps<CategoryOption, false, GroupBase<CategoryOption>>
  >
  | null
  | undefined = (props) => {
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
  props: OptionProps<CategoryOption, false, GroupBase<CategoryOption>> & {
    showTooltips: boolean
    convertToSourceLink?: (details: MatchDetails) => { href: string, text: string, target?: string }
  },
) => {
  if (props.data.payload.option_type === OptionActionType.HIDDEN) {
    return null
  }

  if (props.data.type === 'match') {
    const sourceLink = props.convertToSourceLink && props.data.payload.details
      ? props.convertToSourceLink(props.data.payload.details)
      : null

    return (
      <components.Option
        {...props}
        className={`${props.className} Layer__select__option-content__match`}
      >
        <div className='Layer__select__option-content__match__main-row'>
          <span className='Layer__select__option-content__match__date'>
            {props.data.payload.date
              && formatTime(parseISO(props.data.payload.date), DATE_FORMAT)}
          </span>
          <span className='Layer__select__option-content__match__description'>
            {props.data.payload.display_name}
          </span>
          {sourceLink && (
            <a
              href={sourceLink.href}
              target={sourceLink.target}
              onClick={e => e.stopPropagation()}
              className='Layer__select__option-content__match__link'
            >
              {sourceLink.text}
            </a>
          )}
        </div>
        <div className='Layer__select__option-content__match__amount-row'>
          <span className='Layer__select__option-content__match__amount'>
            $
            {formatMoney(props.data.payload.amount)}
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
      <div className='Layer__select__option-menu--name'>
        {props.isSelected
          ? (
            <span className='Layer__select__option-menu-content-check'>
              <Check size={16} />
            </span>
          )
          : (
            <span className='Layer__select__option-menu-content-check'>
              <div style={{ width: 16, height: 16 }} />
            </span>
          )}
        <div>{props.data.payload.display_name}</div>
      </div>
      {props.showTooltips && props.data.payload.description && (
        <div className='Layer__select__option-menu--tooltip'>
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon />
            </TooltipTrigger>
            <TooltipContent className='Layer__actionable-list__tooltip-content'>
              <Text
                className='Layer__actionable-list__content-description'
                size={TextSize.sm}
              >
                {props.data.payload.description}
              </Text>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
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
          subCategories: null,
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
      return [category]
    }
    return category.subCategories.flatMap(subCategory =>
      getLeafCategories(subCategory),
    )
  }
  return categories.map((category) => {
    return {
      label: category.display_name,
      options: getLeafCategories(category).map(x => mapCategoryToOption(x)),
    } satisfies GroupBase<CategoryOption>
  })
}

function filterCategories(categories: Category[], hideMainCategories?: string[]) {
  if (!hideMainCategories) {
    return categories
  }

  return categories.filter(category => !hideMainCategories.includes(category.category))
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
  hideMainCategories,
  asDrawer = false,
}: Props) => {
  const { data: categories } = useCategories()
  const { convertToSourceLink } = useMatchDetailsContext()

  const matchOptions =
    !excludeMatches && bankTransaction?.suggested_matches
      ? [
          {
            label: 'Match',
            options: bankTransaction.suggested_matches.map((x) => {
              return {
                type: OptionActionType.MATCH,
                payload: {
                  id: x.id,
                  option_type: OptionActionType.MATCH,
                  display_name: x.details.description,
                  date: x.details.date,
                  amount: x.details.amount,
                  subCategories: null,
                  details: x.details,
                },
              } satisfies CategoryOption
            }),
          } satisfies GroupBase<CategoryOption>,
      ]
      : []

  const suggestedOptions =
    bankTransaction?.categorization_flow?.type
    === CategorizationType.ASK_FROM_SUGGESTIONS
      ? [
          {
            label: 'Suggestions',
            options: bankTransaction.categorization_flow.suggestions.map(x =>
              mapCategoryToOption(x),
            ),
          } satisfies GroupBase<CategoryOption>,
      ]
      : []

  const categoryOptions = flattenCategories(categories ?? [])

  const options = [
    ...matchOptions,
    ...suggestedOptions,
    ...allCategoriesDivider,
    ...categoryOptions,
  ]

  const selected = value
    ? value
    : !excludeMatches
      && matchOptions?.length === 1
      && matchOptions[0].options.length === 1
      ? matchOptions[0].options[0]
      : undefined

  const placeholder =
    matchOptions?.length === 1 && matchOptions[0].options.length > 1
      ? `${matchOptions[0].options.length} possible matches...`
      : 'Categorize or match...'

  if (asDrawer) {
    return (
      <CategorySelectDrawer
        onSelect={onChange}
        selected={value}
        showTooltips={showTooltips}
      />
    )
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
      components={{
        DropdownIndicator,
        GroupHeading,
        Option: optionProps => (
          <Option {...optionProps} showTooltips={showTooltips} convertToSourceLink={convertToSourceLink} />
        ),
      }}
      isDisabled={disabled}
      isOptionDisabled={option => option.disabled ?? false}
      isOptionSelected={option =>
        selected?.payload.display_name == option.payload.display_name}
    />
  )
}
