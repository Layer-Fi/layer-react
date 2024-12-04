import React from 'react'
import { centsToDollars, Direction, getMoM } from '../util'
import { LineItem, DisplayType } from '../../../types'
import classNames from 'classnames'

interface Props {
  lineItem: LineItem | null | undefined;
  priorLineItem?: LineItem | null;
  direction: Direction;
  depth?: number;
  maxDepth?: number;
  displayType: DisplayType;
  lastLineItem?: boolean;
  lowerIsBetter?: boolean;
}

const PNLRow = ({
  lineItem,
  direction,
  depth = 0,
  maxDepth = 1,
  displayType = 'values',
  lastLineItem = false,
  priorLineItem,
  lowerIsBetter = false,
}: Props) => {
  if (!lineItem) {
    // TODO: return placeholder
    return null
  }

  const { value, display_name: displayName, line_items: lineItems } = lineItem
  const priorValue = priorLineItem?.value
  const priorLineItems = priorLineItem?.line_items

  const amount = value ?? 0

  const hasDisplayableChildren = lineItems?.length && depth < maxDepth

  let borderColorClass = ''
  if (displayType === 'month-over-month') {
    if (hasDisplayableChildren || (depth > 0 && !lastLineItem)) {
      borderColorClass = 'Layer__pdf-table-cell--light-border'
    } else {
      borderColorClass = ''
    }
  } else if (hasDisplayableChildren || (depth > 0 && !lastLineItem)) {
    borderColorClass = 'Layer__pdf-table-cell--light-border'
  }

  const showAmountNegative =
    (lowerIsBetter && !lineItem.is_contra) // in this section, values are negative
    || (!lowerIsBetter && lineItem.is_contra) // positve section, but it's a contra account

  const mOM = getMoM(priorValue || 0, value || 0)
  const mOMPositive = isNaN(mOM) ? undefined : mOM >= 0
  let cellValue
  if (displayType === 'labels') {
    cellValue = (
      <div
        className={
          classNames(
            'Layer__pdf-label-cell',
            depth > 0 ? 'Layer__pdf-label-cell--indented' : ''
          )
        }
      >
        {displayName}
      </div>
    )
  } else if (displayType === 'values') {
    cellValue = (
      <div className='Layer__pdf-value-cell'>
        {centsToDollars((showAmountNegative && amount !== 0 ? -1 : 1) * amount)}
      </div>
    )
  } else {
    cellValue = (
      <div className='Layer__pdf-value-cell'>
        {isNaN(mOM) || !isFinite(mOM)
          ? '-'
          : `${mOM > 0 ? '+' : ''}${mOM.toFixed(1)}%`}
      </div>
    )
  }

  let showPositiveColor: boolean | null = null
  if (displayType === 'month-over-month' && mOMPositive !== undefined) {
    showPositiveColor = lowerIsBetter ? !mOMPositive : mOMPositive
    if (lineItem.is_contra) {
      showPositiveColor = !showPositiveColor
    }
  }

  return (
    <div className='Layer__pdf-table-cell-wrapper'>
      <div
        className={
          classNames(
            'Layer__pdf-table-cell',
            displayType === 'labels' ? 'Layer__pdf-table-cell--label-cell' : '',
            showPositiveColor === true ? 'Layer__pdf-table-cell--positive' : '',
            showPositiveColor === false ? 'Layer__pdf-table-cell--negative' : '',
            borderColorClass,
          )
        }
      >
        {cellValue}
      </div>

      {depth < maxDepth
        && (lineItems || []).map((lineItem, idx) => (
          <PNLRow
            key={`pnl-row-${depth}-${idx}`}
            lineItem={lineItem}
            depth={depth + 1}
            maxDepth={maxDepth}
            direction={direction}
            displayType={displayType}
            lastLineItem={lineItems ? idx === lineItems.length - 1 : false}
            priorLineItem={priorLineItems ? priorLineItems[idx] : undefined}
            lowerIsBetter={lowerIsBetter}
          />
        ))}
    </div>
  )
}

export default PNLRow
