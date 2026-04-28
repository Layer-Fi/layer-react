import classNames from 'classnames'

import CheckIcon from '@icons/Check'
import ChevronRight from '@icons/ChevronRight'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
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
    <ul className={classNames('Layer__ActionableList', className)}>
      {options.map(x => (
        <li
          role='button'
          onClick={() => onClick(x)}
          key={x.id}
          className={classNames(
            'Layer__ActionableList__Item',
            x.secondary && 'Layer__ActionableList__Item--Secondary',
            x.asLink && 'Layer__ActionableList__Item--AsLink',
            selectedId === x.id && 'Layer__ActionableList__Item--Selected',
          )}
        >
          <VStack gap='2xs' align='start' className='Layer__ActionableList__Content'>
            <Text size={TextSize.sm}>{x.label}</Text>
            {
              showDescriptions
              && x.description
              && (
                <Text
                  className='Layer__ActionableList__ContentDescription'
                  size={TextSize.sm}
                >
                  {x.description}
                </Text>
              )
            }
          </VStack>
          {!x.asLink && selectedId && selectedId === x.id
            ? (
              <Span className='Layer__ActionableList__Select Layer__ActionableList__Select--Selected'>
                <CheckIcon
                  size={14}
                />
              </Span>
            )
            : null}
          {!x.asLink && (!selectedId || selectedId !== x.id)
            ? (
              <Span className='Layer__ActionableList__Select' />
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
