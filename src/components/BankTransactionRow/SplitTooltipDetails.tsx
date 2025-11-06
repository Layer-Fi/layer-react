import { centsToDollars as formatMoney } from '../../models/Money'
import { isSplitCategorizationEncoded, type CategorizationEncoded } from '@schemas/categorization'

export const SplitTooltipDetails = ({
  classNamePrefix,
  category,
}: {
  classNamePrefix: string
  category: CategorizationEncoded | null
}) => {
  if (!category || !isSplitCategorizationEncoded(category)) {
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
