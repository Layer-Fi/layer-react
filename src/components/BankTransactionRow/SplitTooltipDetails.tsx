import React from 'react'
import { centsToDollars as formatMoney } from '../../models/Money'
import { Category } from '../../types'

export const SplitTooltipDetails = ({
  classNamePrefix,
  category,
}: {
  classNamePrefix: string
  category: Category
}) => {
  if (!category.entries) {
    return
  }

  return (
    <span className={`${classNamePrefix}__split-tooltip`}>
      <ul>
        {category.entries.map((entry, idx) => (
          <li key={idx}>
            <span className={`${classNamePrefix}__split-tooltip__label`}>
              {entry.category.display_name}
            </span>
            <span className={`${classNamePrefix}__split-tooltip__value`}>
              $
              {formatMoney(entry.amount)}
            </span>
          </li>
        ))}
      </ul>
    </span>
  )
}
