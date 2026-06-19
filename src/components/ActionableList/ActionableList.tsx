import classNames from 'classnames'
import { Check, ChevronRight } from 'lucide-react'

import { VStack } from '@ui/Stack/Stack'
import { P, Span } from '@ui/Typography/Text'

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
            x.secondary && 'Layer__ActionableList__Item--secondary',
            x.asLink && 'Layer__ActionableList__Item--asLink',
            selectedId === x.id && 'Layer__ActionableList__Item--selected',
          )}
        >
          <VStack gap='2xs' align='start' className='Layer__ActionableList__Content'>
            <P size='sm' variant='inherit'>{x.label}</P>
            {
              showDescriptions
              && x.description
              && (
                <P size='sm' variant='subtle'>{x.description}</P>
              )
            }
          </VStack>
          {!x.asLink && selectedId && selectedId === x.id
            ? (
              <Span className='Layer__ActionableList__Select Layer__ActionableList__Select--selected'>
                <Check
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
