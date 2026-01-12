import { Legend } from 'recharts'

import { STRIPE_PATTERN_DARK_FILL } from './ProfitAndLossChartPatternDefs'

const PROFIT_AND_LOSS_CHART_LEGEND_PAYLOAD = [
  {
    value: 'Revenue',
    type: 'circle',
    id: 'IncomeLegend',
  },
  {
    value: 'Expenses',
    type: 'circle',
    id: 'ExpensesLegend',
  },
  {
    value: 'Uncategorized',
    type: 'circle',
    id: 'UncategorizedLegend',
  },
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

const renderLegendContent = () => {
  return (
    <ul className='Layer__chart-legend-list'>
      {PROFIT_AND_LOSS_CHART_LEGEND_PAYLOAD.map((entry, idx) => (
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

export const ProfitAndLossChartLegend = () => (
  <Legend verticalAlign='top' align='right' content={renderLegendContent} />
)
