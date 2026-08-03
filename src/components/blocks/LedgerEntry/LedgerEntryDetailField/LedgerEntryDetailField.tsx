import { type ReactNode } from 'react'
import classNames from 'classnames'

import { SkeletonLoader } from '@ui/SkeletonLoader/SkeletonLoader'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './ledgerEntryDetailField.scss'

export interface LedgerEntryDetailFieldProps {
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

export const LedgerEntryDetailField = ({ label, children, isLoading, fullWidth }: LedgerEntryDetailFieldProps) => {
  return (
    <VStack gap='3xs' className={classNames('Layer__LedgerEntryDetailField', fullWidth && 'Layer__LedgerEntryDetailField--fullWidth')}>
      <dt>
        <Span size='xs' weight='normal' textCase='uppercase' variant='subtle'>
          {label}
        </Span>
      </dt>
      <dd className='Layer__LedgerEntryDetailField__Value'>
        {isLoading ? <SkeletonLoader /> : renderValue(children)}
      </dd>
    </VStack>
  )
}
