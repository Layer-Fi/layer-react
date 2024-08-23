import React from 'react'
import { centsToDollars as formatMoney } from '../../models/Money'
import { Text, TextSize, TextWeight } from '../Typography'
import { ChartData } from './DetailedChart'
import { ColorsMapOption } from './DetailedTable'
import classNames from 'classnames'

interface HorizontalLineChartProps {
  data?: ChartData[]
  uncategorizedTotal: number
  netValue?: number
  type: string
  typeColorMapping: ColorsMapOption[]
  hoveredItem?: string
  setHoveredItem: (name?: string) => void
}

export const HorizontalLineChart = ({
  data,
  uncategorizedTotal,
  netValue,
  type,
  typeColorMapping,
  hoveredItem,
  setHoveredItem,
}: HorizontalLineChartProps) => {
  if (!data) {
    return
  }

  const total = data.reduce((x, { value }) => (value < 0 ? x : x + value), 0)

  const items = data
    .filter(x => x.value >= 0 && x.type !== 'empty')
    .map(x => ({ ...x, share: x.value / total }))

  if (uncategorizedTotal > 0) {
    items.push({
      name: 'Uncategorized',
      value: uncategorizedTotal,
      type: 'uncategorized',
      share: uncategorizedTotal / total,
    })
  }

  return (
    <div className='Layer__profit-and-loss-horiztonal-line-chart'>
      <div className='Layer__profit-and-loss-horiztonal-line-chart__details-row'>
        <Text
          className='Layer__profit-and-loss-horiztonal-line-chart__details-label'
          size={TextSize.sm}
        >
          Net {type}
        </Text>
        <Text
          className='Layer__profit-and-loss-horiztonal-line-chart__details-value'
          size={TextSize.sm}
          weight={TextWeight.bold}
        >
          {`$${formatMoney(netValue)}`}
        </Text>
      </div>
      {!items || items.length === 0 ? (
        <div className='Layer__profit-and-loss-horiztonal-line-chart__bar'>
          <span className='Layer__profit-and-loss-horiztonal-line-chart__item Layer__profit-and-loss-horiztonal-line-chart__item--placeholder' />
        </div>
      ) : (
        <div className='Layer__profit-and-loss-horiztonal-line-chart__bar'>
          {items.map(x => {
            if (x.type === 'uncategorized') {
              return (
                <svg
                  viewBox={`0 0 9 ${x.share * 100}%`}
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  width={`${x.share * 100}%`}
                  height='9'
                >
                  <defs>
                    <pattern
                      id='layer-pie-stripe-pattern'
                      x='0'
                      y='0'
                      width='4'
                      height='4'
                      patternTransform='rotate(45)'
                      patternUnits='userSpaceOnUse'
                    >
                      <rect width='4' height='4' opacity={0.16} />
                      <line x1='0' y='0' x2='0' y2='4' strokeWidth='2' />
                    </pattern>
                    <pattern
                      id='layer-pie-dots-pattern-line-chart'
                      x='0'
                      y='0'
                      width='3'
                      height='3'
                      patternUnits='userSpaceOnUse'
                    >
                      <rect width='1' height='1' opacity={0.76} />
                    </pattern>
                  </defs>
                  <rect
                    width='100%'
                    height='9'
                    id='layer-pie-dots-pattern-bg-line-chart'
                    rx='2'
                  />
                  <rect
                    width='100%'
                    height='9'
                    fill='url(#layer-pie-stripe-pattern)'
                  />
                </svg>
              )
            }

            const { color, opacity } =
              typeColorMapping.find(y => y.name === x.name) ??
              typeColorMapping[0]

            return (
              <span
                className={classNames(
                  'Layer__profit-and-loss-horiztonal-line-chart__item',
                  hoveredItem && hoveredItem !== x.name
                    ? 'Layer__profit-and-loss-horiztonal-line-chart__item--inactive'
                    : undefined,
                )}
                style={{
                  width: `${x.share * 100}%`,
                  background: color,
                  opacity,
                }}
                onMouseEnter={() => setHoveredItem(x.name)}
                onMouseLeave={() => setHoveredItem(undefined)}
              />
            )
          })}
        </div>
      )}
      <div className='Layer__profit-and-loss-horiztonal-line-chart__details-row'>
        <div className='Layer__profit-and-loss-horiztonal-line-chart__details-col'>
          <Text
            className='Layer__profit-and-loss-horiztonal-line-chart__details-label'
            size={TextSize.sm}
          >
            Categorized
          </Text>
          <Text
            className='Layer__profit-and-loss-horiztonal-line-chart__details-value'
            size={TextSize.sm}
            weight={TextWeight.bold}
          >
            {`$${formatMoney(total)}`}
          </Text>
        </div>
        <div className='Layer__profit-and-loss-horiztonal-line-chart__details-col Layer__align-end'>
          <Text
            className='Layer__profit-and-loss-horiztonal-line-chart__details-label'
            size={TextSize.sm}
          >
            Uncategorized
          </Text>
          <Text
            className='Layer__profit-and-loss-horiztonal-line-chart__details-value'
            size={TextSize.sm}
            weight={TextWeight.bold}
          >{`$${formatMoney(uncategorizedTotal)}`}</Text>
        </div>
      </div>
    </div>
  )
}
