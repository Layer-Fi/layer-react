import { type ReactNode } from 'react'
import classNames from 'classnames'

import { SkeletonLoader } from '@ui/SkeletonLoader/SkeletonLoader'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './entryDetailField.scss'

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
    <VStack gap='3xs' className={classNames('Layer__EntryDetailField', fullWidth && 'Layer__EntryDetailField--fullWidth')}>
      <dt>
        <Span size='xs' weight='normal' textCase='uppercase' variant='subtle'>
          {label}
        </Span>
      </dt>
      <dd className='Layer__EntryDetailField__Value'>
        {isLoading ? <SkeletonLoader /> : renderValue(children)}
      </dd>
    </VStack>
  )
}
