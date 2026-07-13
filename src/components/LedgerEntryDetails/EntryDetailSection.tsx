import { type ReactNode } from 'react'
import classNames from 'classnames'

import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { SkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'

import './entryDetailSection.scss'

export interface EntryDetailSectionProps {
  title?: ReactNode
  children: ReactNode
}

export const EntryDetailSection = ({ title, children }: EntryDetailSectionProps) => {
  return (
    <section className='Layer__EntryDetailSection'>
      {title && (
        <Heading level={3} size='sm' pbe='md'>
          {title}
        </Heading>
      )}
      <dl className='Layer__EntryDetailSection__Grid'>{children}</dl>
    </section>
  )
}

export interface EntryDetailFieldProps {
  label: ReactNode
  children: ReactNode | string
  isLoading?: boolean
  /** Stretch the field across both columns (e.g. memo, reversal reference). */
  fullWidth?: boolean
}

const renderValue = (value: ReactNode | string) => {
  if (typeof value === 'string') {
    return (
      <Span size='sm' weight='bold'>
        {value}
      </Span>
    )
  }

  return value
}

export const EntryDetailField = ({ label, children, isLoading, fullWidth }: EntryDetailFieldProps) => {
  return (
    <VStack gap='3xs' className={classNames('Layer__EntryDetailSection__Field', fullWidth && 'Layer__EntryDetailSection__Field--fullWidth')}>
      <dt>
        <Span size='xs' weight='normal' textCase='uppercase' variant='subtle'>
          {label}
        </Span>
      </dt>
      <dd className='Layer__EntryDetailSection__Value'>
        {isLoading ? <SkeletonLoader /> : renderValue(children)}
      </dd>
    </VStack>
  )
}
