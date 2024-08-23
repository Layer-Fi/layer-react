import React from 'react'
import { centsToDollars as formatMoney } from '../../models/Money'
import { Text, TextSize, TextWeight } from '../Typography'
import { ChartData } from './DetailedChart'
import { ColorsMapOption } from './DetailedTable'

export const HorizontalLineChart = ({
  data,
  uncategorizedTotal,
  netValue,
  type,
  typeColorMapping,
}: {
  data?: ChartData[]
  uncategorizedTotal: number
  netValue?: number
  type: string
  typeColorMapping: ColorsMapOption[]
}) => {
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
          {items.map((x, index) => {
            if (x.type === 'uncategorized') {
              return (
                <span
                  className='Layer__profit-and-loss-horiztonal-line-chart__item'
                  style={{ width: `${x.share * 100}%`, background: '#f2f2f2' }}
                />
              )
            }

            const { color, opacity } =
              typeColorMapping.find(y => y.name === x.name) ??
              typeColorMapping[0]
            return (
              <span
                className='Layer__profit-and-loss-horiztonal-line-chart__item'
                style={{
                  width: `${x.share * 100}%`,
                  background: color,
                  opacity,
                }}
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
