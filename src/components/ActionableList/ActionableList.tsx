import classNames from 'classnames'

import CheckIcon from '@icons/Check'
import ChevronRight from '@icons/ChevronRight'
import { VStack } from '@ui/Stack/Stack'
import { Text, TextSize } from '@components/Typography/Text'

import './actionableList.scss'

export interface ActionableListOption<T> {
  label: string
  id: string
  description?: string
  value: T
  asLink?: boolean
  secondary?: boolean
}

interface ActionableListProps<T> {
  options: ActionableListOption<T>[]
  onClick: (item: ActionableListOption<T>) => void
  selectedId?: string
  showDescriptions?: boolean
  className?: string
}

export const ActionableList = <T,>({
  options,
  onClick,
  selectedId,
  showDescriptions = false,
  className,
}: ActionableListProps<T>) => {
  return (
    <ul className={classNames('Layer__actionable-list', className)}>
      {options.map(x => (
        <li
          role='button'
          onClick={() => onClick(x)}
          key={x.id}
          className={classNames(
            'Layer__actionable-list__item',
            x.secondary && 'Layer__actionable-list__item--secondary',
            x.asLink && 'Layer__actionable-list__item--as-link',
            selectedId === x.id && 'Layer__actionable-list__item--selected',
          )}
        >
          <VStack gap='2xs' align='start' className='Layer__actionable-list__content'>
            <Text size={TextSize.sm}>{x.label}</Text>
            {
              showDescriptions
              && x.description
              && (
                <Text
                  className='Layer__actionable-list__content-description'
                  size={TextSize.sm}
                >
                  {x.description}
                </Text>
              )
            }
          </VStack>
          {!x.asLink && selectedId && selectedId === x.id
            ? (
              <span className='Layer__actionable-list__select Layer__actionable-list__select--selected'>
                <CheckIcon
                  size={14}
                />
              </span>
            )
            : null}
          {!x.asLink && (!selectedId || selectedId !== x.id)
            ? (
              <span className='Layer__actionable-list__select' />
            )
            : null}
          {x.asLink && (
            <ChevronRight
              size={16}
            />
          )}
        </li>
      ))}
    </ul>
  )
}
