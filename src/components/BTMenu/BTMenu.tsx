import React from 'react'
import Select, {
  DropdownIndicatorProps,
  GroupHeadingProps,
  GroupBase,
  OptionProps,
  components,
} from 'react-select'
import { useLayerContext } from '../../hooks/useLayerContext'
import Check from '../../icons/Check'
import ChevronDown from '../../icons/ChevronDown'
import MinimizeTwo from '../../icons/MinimizeTwo'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction, CategorizationType, Category } from '../../types'
import { Badge } from '../Badge'
import { BadgeSize } from '../Badge/Badge'
import { parseISO, format as formatTime } from 'date-fns'

const dateFormat = 'LLL d, yyyy'

type Props = {
  name?: string
  bankTransaction: BankTransaction
  value: Category | undefined
  onChange: (newValue: Category) => void
  disabled?: boolean
  className?: string
}

export type BTType = 'category' | 'match' // @TODO into enum or consolidate

export interface BTOptions {
  type: BTType
  label: string
  main?: boolean
  payload: any // @TODO carry whole tx, category or match
}

const DropdownIndicator:
  | React.ComponentType<
      DropdownIndicatorProps<Category, false, GroupBase<Category>>
    >
  | null
  | undefined = props => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown />
    </components.DropdownIndicator>
  )
}

const GroupHeading = (props: GroupHeadingProps<BTOptions>) => {
  return (
    <components.GroupHeading
      className={`${props.className} ${
        props.data.main ? 'Layer__select__group-heading--main' : ''
      }`}
      {...props}
    />
  )
}

const Option = (props: OptionProps<BTOptions>) => {
  if (props.data.payload.option_type === 'separator') {
    return (
      <div className='Layer__select__option--separator'>
        {props.data.payload.display_name}
      </div>
    )
  }

  if (props.data.type === 'match') {
    return (
      <components.Option
        {...props}
        className={`${props.className} Layer__select__option-content__match`}
      >
        <div className='Layer__select__option-content__match__main-row'>
          <span className='Layer__select__option-content__match__date'>
            {formatTime(parseISO(props.data.payload.date), dateFormat)}
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

export const BTMenu = ({
  bankTransaction,
  name,
  value,
  onChange,
  disabled,
  className,
}: Props) => {
  const { categories } = useLayerContext()

  const matchOptions = bankTransaction?.suggested_matches
    ? [
        {
          label: 'Match',
          main: true,
          options: bankTransaction.suggested_matches.map(x => {
            return {
              type: 'match',
              payload: {
                id: x.id,
                option_type: 'match',
                display_name: x.details.description,
                date: x.details.date,
                amount: x.details.amount,
              },
            } as unknown as BTType
          }),
        },
      ]
    : []

  const suggestedOptions =
    bankTransaction?.categorization_flow?.type ===
    CategorizationType.ASK_FROM_SUGGESTIONS
      ? [
          {
            label: 'Suggestions',
            options: bankTransaction.categorization_flow.suggestions,
          },
        ]
      : []

  const categoryOptions = (categories || [])
    .map(category => {
      if (category?.subCategories && category?.subCategories?.length > 0) {
        return {
          label: category.display_name,
          options: category.subCategories.map(x => {
            return {
              type: 'category',
              payload: x,
            }
          }),
        }
      }
      return {
        label: category.display_name,
        options: [
          {
            type: 'category',
            payload: category,
          },
        ],
      }
    })
    .filter(x => x)

  const allCategoriesDivider = [
    {
      value: 'All categories',
      payload: {
        id: 'all_categories',
        option_type: 'separator',
        display_name: 'ALL CATEGORIES',
        amount: 0,
      },
    },
  ]

  const options = [
    ...matchOptions,
    ...suggestedOptions,
    ...allCategoriesDivider,
    ...categoryOptions,
  ]

  const selected = value
    ? value
    : matchOptions?.length === 1 && matchOptions[0].options.length === 1
    ? matchOptions[0].options[0]
    : undefined

  // @TODO ^ do this same for suggested options so user can just click approve - parent component handles this probably - need some test data from API to verify

  const placeholder =
    matchOptions?.length === 1 && matchOptions[0].options.length > 1
      ? `${matchOptions[0].options.length} possible matches...`
      : 'Categorize or match...'

  // The menu does not show in all cases unless the
  // menuPortalTarget and styles lines exist
  // See: https://stackoverflow.com/questions/55830799/how-to-change-zindex-in-react-select-drowpdown
  return (
    <Select<Category>
      name={name}
      className={`Layer__category-menu Layer__select ${className ?? ''}`}
      classNamePrefix='Layer__select'
      options={options}
      isSearchable={true}
      placeholder={placeholder}
      defaultValue={selected}
      formatOptionLabel={props => {
        console.log('format', props)
        return (
          <div className='Layer__select__option-label'>
            {props.type === 'match' && (
              <Badge size={BadgeSize.SMALL} icon={<MinimizeTwo size={11} />}>
                Match
              </Badge>
            )}
            <span>{props.payload.display_name}</span>
          </div>
        )
        // return (
        //   <div className='Layer__select__option-menu-content'>
        //     <div>{props.payload.display_name}</div>
        //     {value?.payload.id === props.payload.id ? (
        //       <span className='Layer__select__option-menu-content-check'>
        //         <Check size={16} />
        //       </span>
        //     ) : null}
        //   </div>
        // )
      }}
      value={value}
      onChange={newValue => newValue && onChange(newValue)}
      getOptionLabel={category => category.payload.display_name}
      getOptionValue={category => {
        // return category.stable_name || category.category
        // return category.payload.display_name
        return category.payload.id
      }}
      menuPortalTarget={document.body}
      styles={{
        menuPortal: base => ({ ...base, zIndex: 9999 }),
      }}
      components={{ DropdownIndicator, GroupHeading, Option }}
      isDisabled={disabled}
    />
  )
}
