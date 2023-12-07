import React, { useState } from 'react'
import { useBalanceSheet } from '../../hooks/useBalanceSheet'
import { BalanceSheetDatePicker } from '../BalanceSheetDatePicker'
import { BalanceSheetRow } from '../BalanceSheetRow'
import { format } from 'date-fns'

export const BalanceSheet = () => {
  const [effectiveDate, setEffectiveDate] = useState(new Date())
  const { data, isLoading } = useBalanceSheet()
  const assets = {
    name: 'Assets',
    display_name: 'Assets',
    line_items: data?.assets || [],
    value: undefined,
  }
  const lne = {
    name: 'LiabilitiesAndEquity',
    display_name: 'Liabilities & Equity',
    line_items: data?.liabilities_and_equity || [],
    value: undefined,
  }
  const dateString = format(effectiveDate, 'LLL d, yyyy')
  return (
    <div className="Layer__balance-sheet">
      <div className="Layer__balance-sheet__header">
        <h2 className="Layer__balance-sheet__title">
          Balance Sheet - as of {dateString}
        </h2>
        <BalanceSheetDatePicker onChange={setEffectiveDate} />
        <button className="Layer__balance-sheet__download-button">
          Download
        </button>
      </div>
      {!data || isLoading ? (
        <div>Loading</div>
      ) : (
        <div className="Layer__balance-sheet__table">
          <BalanceSheetRow key={assets.name} lineItem={assets} />
          <BalanceSheetRow key={lne.name} lineItem={lne} />
        </div>
      )}
    </div>
  )
}
