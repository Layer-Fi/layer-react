import classNames from 'classnames'
import { Check, ChevronRight } from 'lucide-react'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { VStack } from '@ui/Stack/Stack'
import { P, Span } from '@ui/Typography/Text'

import './actionableList.scss'

const legacyClassNames = createLegacyClassNames({
  'Layer__ActionableList': 'Layer__actionable-list',
  'Layer__ActionableList__Content': 'Layer__actionable-list__content',
  'Layer__ActionableList__Description': ['Layer__actionable-list__content-description', 'Layer__ActionableList__ContentDescription'],
  'Layer__ActionableList__Select': 'Layer__actionable-list__select',
  'Layer__ActionableList__Select--selected': 'Layer__actionable-list__select--selected',
  'Layer__ActionableList__Item--asLink': 'Layer__actionable-list-item--as-link',
  'Layer__ActionableList__Item--secondary': 'Layer__actionable-list-item--secondary',
  'Layer__ActionableList__Item--selected': 'Layer__actionable-list__item--selected',
})

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
    <ul className={classNames(legacyClassNames('Layer__ActionableList'), className)}>
      {options.map(x => (
        <li
          role='button'
          onClick={() => onClick(x)}
          key={x.id}
          className={classNames(
            'Layer__ActionableList__Item',
            legacyClassNames(
              x.secondary && 'Layer__ActionableList__Item--secondary',
              x.asLink && 'Layer__ActionableList__Item--asLink',
              selectedId === x.id && 'Layer__ActionableList__Item--selected',
            ),
          )}
        >
          <VStack gap='2xs' align='start' className={legacyClassNames('Layer__ActionableList__Content')}>
            <P size='sm' variant='inherit'>{x.label}</P>
            {
              showDescriptions
              && x.description
              && (
                <P size='sm' variant='subtle' className={legacyClassNames('Layer__ActionableList__Description')}>
                  {x.description}
                </P>
              )
            }
          </VStack>
          {!x.asLink && selectedId && selectedId === x.id
            ? (
              <Span className={legacyClassNames('Layer__ActionableList__Select', 'Layer__ActionableList__Select--selected')}>
                <Check
                  size={14}
                />
              </Span>
            )
            : null}
          {!x.asLink && (!selectedId || selectedId !== x.id)
            ? (
              <Span className={legacyClassNames('Layer__ActionableList__Select')} />
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
