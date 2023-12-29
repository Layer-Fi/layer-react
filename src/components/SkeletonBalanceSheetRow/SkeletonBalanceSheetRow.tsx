import React, { PropsWithChildren } from 'react'
import ChevronDown from '../../icons/ChevronDown'

type Props = PropsWithChildren

export const SkeletonBalanceSheetRow = ({ children }: Props) => {
  const labelClasses = [
    'Layer__balance-sheet-row',
    'Layer__balance-sheet-row__label',
    'Layer__balance-sheet-row__label--skeleton',
  ]
  const valueClasses = [
    'Layer__balance-sheet-row',
    'Layer__balance-sheet-row__value',
    'Layer__balance-sheet-row__value--skeleton',
  ]
  return (
    <>
      <div className={labelClasses.join(' ')}>
        {children && <ChevronDown size={16} />}
        <div
          style={{ width: '20rem' }}
          className="Layer__balance-sheet-row__skeleton-text"
        >
          {' '}
        </div>
      </div>
      <div className={valueClasses.join(' ')}>
        <div
          style={{ width: '4rem' }}
          className="Layer__balance-sheet-row__skeleton-text"
        >
          {' '}
        </div>
      </div>
      {children && (
        <div className="Layer__balance-sheet-row__children Layer__balance-sheet-row__children--expanded Layer__balance-sheet-row__children--skeleton">
          {children}
        </div>
      )}
    </>
  )
}
