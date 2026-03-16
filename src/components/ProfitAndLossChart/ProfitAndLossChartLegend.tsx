import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Legend } from 'recharts'

import { translationKey } from '@utils/i18n/translationKey'

import { STRIPE_PATTERN_DARK_FILL } from './ProfitAndLossChartPatternDefs'

const LEGEND_ENTRY_CONFIG = [
  { ...translationKey('common.revenue', 'Revenue'), type: 'circle', id: 'IncomeLegend' },
  { ...translationKey('common.expenses', 'Expenses'), type: 'circle', id: 'ExpensesLegend' },
  { ...translationKey('common.uncategorized', 'Uncategorized'), type: 'circle', id: 'UncategorizedLegend' },
]

const LegendIcon = ({ fill }: { fill?: string }) => (
  <svg
    className='recharts-surface'
    width='15'
    height='15'
    viewBox='0 0 15 15'
    style={{
      display: 'inline-block',
      verticalAlign: 'middle',
      marginRight: 4,
    }}
  >
    <circle cx='7' cy='7' r='7' fill={fill} />
  </svg>
)

const renderLegendContent = (payload: { value: string, type: string, id: string }[]) => {
  return (
    <ul className='Layer__chart-legend-list'>
      {payload.map((entry, idx) => (
        <li
          key={`legend-item-${idx}`}
          className={`recharts-legend-item legend-item-${idx}`}
        >
          <LegendIcon fill={entry.id === 'UncategorizedLegend' ? STRIPE_PATTERN_DARK_FILL : undefined} />
          {entry.value}
        </li>
      ))}
    </ul>
  )
}

export const ProfitAndLossChartLegend = () => {
  const { t } = useTranslation()
  const payload = useMemo(() => LEGEND_ENTRY_CONFIG.map(entry => ({
    value: t(entry.i18nKey, entry.defaultValue),
    type: entry.type,
    id: entry.id,
  })), [t])
  return (
    <Legend verticalAlign='top' align='right' content={renderLegendContent(payload)} />
  )
}
