import classNames from 'classnames'
import { Check, ChevronRight } from 'lucide-react'

import { createOwnLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { VStack } from '@ui/Stack/Stack'
import { P, Span } from '@ui/Typography/Text'

import './actionableList.scss'

const legacyClassNames = createOwnLegacyClassNames()({
  'Layer__ActionableList': 'Layer__actionable-list',
  'Layer__ActionableList__Content': 'Layer__actionable-list__content',
  'Layer__ActionableList__Description': ['Layer__actionable-list__content-description', 'Layer__ActionableList__ContentDescription'],
  'Layer__ActionableList__Select': 'Layer__actionable-list__select',
  'state:selectedSelect': ['Layer__actionable-list__select--selected', 'Layer__ActionableList__Select--selected'],
  'state:asLink': ['Layer__actionable-list-item--as-link', 'Layer__ActionableList__Item--asLink'],
  'state:secondary': ['Layer__actionable-list-item--secondary', 'Layer__ActionableList__Item--secondary'],
  'state:selected': ['Layer__actionable-list__item--selected', 'Layer__ActionableList__Item--selected'],
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
              x.secondary && 'state:secondary',
              x.asLink && 'state:asLink',
              selectedId === x.id && 'state:selected',
            ),
          )}
          {...toDataProperties({
            'secondary': Boolean(x.secondary),
            'as-link': Boolean(x.asLink),
            'selected': selectedId === x.id,
          })}
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
              <Span className={legacyClassNames('Layer__ActionableList__Select', 'state:selectedSelect')} {...toDataProperties({ selected: true })}>
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
